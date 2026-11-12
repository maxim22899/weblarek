import "./scss/styles.scss";

import { Api } from "./components/base/Api";
import { EventEmitter } from "./components/base/Events";
import { API_URL, CDN_URL } from "./utils/constants";

import { Catalog } from "./components/Models/Catalog";
import { Basket } from "./components/Models/Basket";
import { Buyer } from "./components/Models/Buyer";

import { Header } from "./components/view/Header";
import { Gallery } from "./components/view/Gallery";
import { Modal } from "./components/view/Modal";
import { CardCatalog } from "./components/view/CardCatalog";
import { CardPreview } from "./components/view/CardPreview";
import { CardBasket } from "./components/view/CardBasket";
import { Basket as BasketView } from "./components/view/Basket";
import { OrderForm } from "./components/view/OrderForm";
import { ContactsForm } from "./components/view/ContactsForm";
import { Success } from "./components/view/Success";

import { LarekApi } from "./components/Api/LarekApi";
import { IProduct, IBuyer } from "./types";
import { ensureElement } from "./utils/utils";

const events = new EventEmitter();
const catalogModel = new Catalog(events);
const basketModel = new Basket(events);
const buyerModel = new Buyer(events);

const baseApi = new Api(API_URL);
const larekApi = new LarekApi(baseApi);

const headerContainer = ensureElement<HTMLElement>('.header');
const galleryContainer = ensureElement<HTMLElement>('.gallery');
const modalContainer = ensureElement<HTMLElement>('#modal-container');

const header = new Header(events, headerContainer);
const gallery = new Gallery(galleryContainer);
const modal = new Modal(events, modalContainer);

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');

const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

const basketView = new BasketView(events, basketTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement);
const orderForm = new OrderForm(orderTemplate.content.firstElementChild as HTMLFormElement, events);
const contactsForm = new ContactsForm(contactsTemplate.content.firstElementChild as HTMLFormElement, events);
const successView = new Success(successTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement, events);
const cardPreview = new CardPreview(cardPreviewTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement, events);

events.on('catalog:changed', () => {
    const items = catalogModel.getItems().map((item: IProduct) => {
        const card = new CardCatalog(cardCatalogTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement, () => {
            events.emit('card:select', item);
        });     
        return card.render({ 
            title: item.title, 
            price: item.price, 
            category: item.category, 
            image: `${CDN_URL}/${item.image}` 
        });
    });
    gallery.catalog = items;
});

events.on('card:select', (item: IProduct) => {
    catalogModel.setPreview(item);
});

events.on('preview:changed', () => {
    const item = catalogModel.getPreview();
    if (!item) return;

    if (item.price === null) {
        cardPreview.buttonText = 'Недоступно';
        cardPreview.buttonDisabled = true;
    } else if (basketModel.hasItem(item.id)) {
        cardPreview.buttonText = 'Удалить из корзины';
        cardPreview.buttonDisabled = false;
    } else {
        cardPreview.buttonText = 'Купить';
        cardPreview.buttonDisabled = false;
    }

    modal.open(cardPreview.render({
    title: item.title,
    price: item.price,
    category: item.category,
    description: item.description,
    image: `${CDN_URL}/${item.image}`,
}));
});

events.on('card:action', () => {
    const item = catalogModel.getPreview();
    if (item) {
        if (basketModel.hasItem(item.id)) {
            basketModel.removeItem(item.id);
        } else {
            basketModel.addItem(item);
        }
        modal.close();
    }
}); 

events.on('basket:changed', () => {
    header.counter = basketModel.getCount();

    const items = basketModel.getItems().map((item, index) => {
        const card = new CardBasket(cardBasketTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement, () => {
            events.emit('basketCard:action', { id: item.id });
        });
        
        card.index = index + 1;
        
        return card.render({ 
            title: item.title, 
            price: item.price 
        });
    });

    basketView.items = items;
    basketView.total = basketModel.getTotalPrice();
    basketView.buttonDisabled = items.length === 0;
});

events.on('basketCard:action', (data: { id: string }) => {
    basketModel.removeItem(data.id);
});

events.on('basket:order', () => {
    const buyerData = buyerModel.getData();
    const errors = buyerModel.validate();
    orderForm.payment = buyerData.payment;
    orderForm.address = buyerData.address;
    orderForm.valid = !errors.payment && !errors.address;
    orderForm.errors = [errors.payment, errors.address].filter(Boolean).join('. ');

    modal.open(orderForm.render());
});

events.on('basket:open', () => {
    modal.open(basketView.render());
});


events.on('form:change', (data: { field: keyof IBuyer, value: string }) => {
    buyerModel.setData({ [data.field]: data.value });
});

events.on('buyer:changed', () => {
    const buyerData = buyerModel.getData();
    const errors = buyerModel.validate();

    orderForm.payment = buyerData.payment;
    orderForm.address = buyerData.address;
    orderForm.valid = !errors.payment && !errors.address;
    
    const orderErrors = [];
    if (errors.payment) orderErrors.push('Не выбран вид оплаты');
    if (errors.address) orderErrors.push('Необходимо указать адрес');
    orderForm.errors = orderErrors.join('. ');

    contactsForm.email = buyerData.email;
    contactsForm.phone = buyerData.phone;
    contactsForm.valid = !errors.email && !errors.phone;
    
    const contactErrors = [];
    if (errors.email) contactErrors.push('Необходимо указать email');
    if (errors.phone) contactErrors.push('Необходимо указать телефон');
    contactsForm.errors = contactErrors.join('. ');
});

events.on('order:submit', () => {
    modal.open(contactsForm.render());
});

events.on('contacts:submit', () => {
    const orderData = {
        ...buyerModel.getData(),
        total: basketModel.getTotalPrice(),
        items: basketModel.getItems().map(item => item.id),
    };

    larekApi.postOrder(orderData)
        .then(response => {
            basketModel.clear();
            buyerModel.clear();
            modal.open(successView.render({ total: response.total }));
        })
        .catch(err => console.error('Ошибка при отправке заказа:', err));
});

events.on('modal:close', () => {
    modal.close();
});
events.on('success:close', () => {
    modal.close();
});

basketModel.clear();
buyerModel.clear();

larekApi.getProducts()
    .then((data) => {
        catalogModel.setItems(data.items); 
    })
    .catch((err) => console.error('Ошибка загрузки товаров:', err));



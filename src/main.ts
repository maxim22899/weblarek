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

const events = new EventEmitter();
const catalogModel = new Catalog(events);
const basketModel = new Basket(events);
const buyerModel = new Buyer(events);

const baseApi = new Api(API_URL);
const larekApi = new LarekApi(baseApi);

const headerContainer = document.querySelector('.header') as HTMLElement;
const galleryContainer = document.querySelector('.gallery') as HTMLElement;
const modalContainer = document.querySelector('#modal-container') as HTMLElement;

const header = new Header(events, headerContainer);
const gallery = new Gallery(galleryContainer);
const modal = new Modal(events, modalContainer);

const cardCatalogTemplate = document.querySelector('#card-catalog') as HTMLTemplateElement;
const cardPreviewTemplate = document.querySelector('#card-preview') as HTMLTemplateElement;
const cardBasketTemplate = document.querySelector('#card-basket') as HTMLTemplateElement;
const basketTemplate = document.querySelector('#basket') as HTMLTemplateElement;
const orderTemplate = document.querySelector('#order') as HTMLFormElement;
const contactsTemplate = document.querySelector('#contacts') as HTMLFormElement;
const successTemplate = document.querySelector('#success') as HTMLTemplateElement;

const basketView = new BasketView(basketTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement, () => {
    events.emit('order:open');
});
const orderForm = new OrderForm(orderTemplate.content.firstElementChild as HTMLFormElement, events);
const contactsForm = new ContactsForm(contactsTemplate.content.firstElementChild as HTMLFormElement, events);
const successView = new Success(successTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement, events);



events.on('catalog: changed', () => {
    console.log('4. событие catalog:changed сработало!');
    const items = catalogModel.getItems().map((item: IProduct) => {
        const card = new CardCatalog(cardCatalogTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement, () => {
            events.emit('card:select', item);
        });
        return card.render({...item, image: `${CDN_URL}/${item.image}`});
    });
    gallery.catalog = items;
});

events.on('card:select', (item: IProduct) => {
    catalogModel.setPreview(item);
});

events.on('preview:changed', () => {
    const item = catalogModel.getPreview();
    if (!item) return;

    const card = new CardPreview(cardPreviewTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement, () => {
        if (basketModel.hasItem(item.id)) {
            basketModel.removeItem(item.id);
        } else {
            basketModel.addItem(item);
        }
        modal.close();
        events.emit('basket:changed');
    });

    if (item.price === null) {
        card.buttonText = 'Недоступно';
        card.buttonDisabled = true;
    } else if (basketModel.hasItem(item.id)) {
        card.buttonText = 'Удалить из корзины';
    } else {
        card.buttonText = 'Купить';
    }

    modal.open(card.render({...item, image: `${CDN_URL}/${item.image}`}));
});

events.on('basket:changed', () => {
    header.counter = basketModel.getCount();

    const items = basketModel.getItems().map((item,index) => {
        const card = new CardBasket(cardBasketTemplate.content.firstElementChild!.cloneNode(true)  as HTMLElement, () => {
            basketModel.removeItem(item.id);
            events.emit('basket:changed');
        });
        card.index = index + 1;
        return card.render({ ...item, image: `${CDN_URL}/${item.image}`});
    });

    basketView.items = items;
    basketView.total = basketModel.getTotalPrice();
});

events.on('basket:open', () => {
    modal.open(basketView.render());
});

events.on('order:open', () => {
    const buyerData = buyerModel.getData();
    
    orderForm.payment = buyerData.payment;
    orderForm.address = buyerData.address;
    orderForm.valid = false; 
    orderForm.errors = ''; 

    modal.open(orderForm.render(buyerData));
});

events.on('form:change', (data: { field: keyof IBuyer, value: string }) => {
    buyerModel.setData({ [data.field]: data.value });
    
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

events. on('buyer: changed', () => {
    console.log('событие buyer:changed сработало');
    const buyerData = buyerModel.getData();
    const errors = buyerModel.validate();

    const isOrderValid = !errors.payment && !errors.address;
    orderForm.valid = isOrderValid;

    const orderErrors = [];
    if (errors.payment) orderErrors.push('Не выбран вид оплаты');
    if (errors.address) orderErrors.push('Необходимо указать адрес');
    orderForm.errors = orderErrors.join('. ');

    orderForm.payment = buyerData.payment;
    orderForm.address = buyerData.address;

    const isContactsValid = !errors.email && !errors.phone;
    contactsForm.valid = isContactsValid;

    const contactsErrors = [];
    if (errors.email) contactsErrors.push('Укажите email');
    if (errors.phone) contactsErrors.push('Укажите телефон');
    contactsForm.errors = contactsErrors.join('. ');

    
    contactsForm.email = buyerData.email;
    contactsForm.phone = buyerData.phone;
});

events.on('form:submit', () => {
    const errors = buyerModel.validate();

    if (errors.payment || errors.address) {
        return; 
    }

    if (errors.email || errors.phone) {
        contactsForm.errors = ''; 
        contactsForm.valid = false; 
        
        modal.open(contactsForm.render(buyerModel.getData()));
        return;
    }

    const orderData = {
        ...buyerModel.getData(),
        total: basketModel.getTotalPrice(),
        items: basketModel.getItems().map(item => item.id)
    };
    
    larekApi.postOrder(orderData as any) 
        .then((response) => {
            basketModel.clear();
            buyerModel.clear();
            events.emit('basket:changed');
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


larekApi.getProducts()
    .then((data) => {
        catalogModel.setItems(data.items);
        const items = catalogModel.getItems().map((item: IProduct) => {
            const card = new CardCatalog(cardCatalogTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement, () => {
                events.emit('card:select', item);
            });
            return card.render({ ...item, image: `${CDN_URL}/${item.image}`});
        });
        gallery.catalog = items;
    })        
    .catch((err) => console.error('Ошибка загрузки товаров:', err));



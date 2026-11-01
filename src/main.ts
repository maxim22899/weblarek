import "./scss/styles.scss";

import { Catalog } from "./components/Models/Catalog";
import { Basket } from "./components/Models/Basket";
import { Buyer } from "./components/Models/Buyer";
import { apiProducts } from "./utils/data";
import { Api } from "./components/base/Api";
import { LarekApi } from "./components/Api/LarekApi";
import { API_URL } from "./utils/constants";

const catalog = new Catalog();
catalog.setItems(apiProducts.items);
console.log("Товары в каталоге:", catalog.getItems());
console.log("Один товар по id:", catalog.getItem(apiProducts.items[0].id));

catalog.setPreview(apiProducts.items[0]);
console.log("Товар для превью:", catalog.getPreview());

const basket = new Basket();
basket.addItem(apiProducts.items[0]);
basket.addItem(apiProducts.items[1]);
console.log("Товары в корзине:", basket.getItems());
console.log("Общая стоимость:", basket.getTotalPrice());
console.log("Количество товаров:", basket.getCount());
console.log(
  "Есть ли товар в корзине?",
  basket.hasItem(apiProducts.items[0].id),
);

basket.removeItem(apiProducts.items[0].id);
console.log("После удаления первого товара:", basket.getItems());
basket.clear();
console.log("После очистки:", basket.getItems());

const buyer = new Buyer();
buyer.setData({ email: "test@test.ru" });
console.log("Данные покупателя:", buyer.getData());
console.log("Ошибки валидации:", buyer.validate());

buyer.setData({
  payment: "card",
  email: "test@test.ru",
  phone: "test",
  address: "test",
});

console.log("Полные данные:", buyer.getData());
console.log("Валидация без ошибок:", buyer.validate());

buyer.clear();
console.log("После очистки:", buyer.getData());

const baseApi = new Api(API_URL);

const larekApi = new LarekApi(baseApi);

console.log("Запрашиваем товары c сервера...");
larekApi
  .getProducts()
  .then((data) => {
    console.log("Ответ от сервера получен!", data);
    catalog.setItems(data.items);
    console.log("Каталог после загрузки с сервера:", catalog.getItems());
  })
  .catch((error) => {
    console.error("Ошибка при запросе к серверу:", error);
  });

import { IBuyer, TBuyerErrors } from "../../types";
import { IEvents } from "../base/Events";

export class Buyer {
  private data: IBuyer = {
    payment: "",
    email: "",
    phone: "",
    address: "",
  };

  constructor(protected events: IEvents) {}

  setData(data: Partial<IBuyer>): void {
    this.data = { ...this.data, ...data };
    this.events.emit('buyer:changed');
  }

  getData(): IBuyer {
    return this.data;
  }

  clear(): void {
    this.data = {
      payment: "",
      email: "",
      phone: "",
      address: "",
    };
    this.events.emit('buyer:changed');
  }

  validate(): TBuyerErrors {
    const errors: TBuyerErrors = {};

    if (!this.data.payment) errors.payment = "Не выбран вид оплаты";
    if (!this.data.email.trim()) errors.email = "Укажите email";
    if (!this.data.phone.trim()) errors.phone = "Укажите телефон";
    if (!this.data.address.trim()) errors.address = "Укажите адрес";

    return errors;
  }
}

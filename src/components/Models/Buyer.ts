import { IBuyer } from "../../types";

export class Buyer {
  private data: IBuyer = {
    payment: "",
    email: "",
    phone: "",
    address: "",
  };

  setData(data: Partial<IBuyer>): void {
    this.data = { ...this.data, ...data };
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
  }

  validate(): Partial<Record<keyof IBuyer, string>> {
    const errors: Partial<Record<keyof IBuyer, string>> = {};

    if (!this.data.payment) errors.payment = "Не выбран вид оплаты";
    if (!this.data.email) errors.email = "Укажите email";
    if (!this.data.phone) errors.phone = "Укажите телефон";
    if (!this.data.address) errors.address = "Укажите адрес";

    return errors;
  }
}

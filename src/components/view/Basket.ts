import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";

interface IBasketData {
    items: HTMLElement[];
    total: number;
}

export class Basket extends Component<IBasketData> {
    protected listElement: HTMLElement;
    protected totalElement: HTMLElement;
    protected orderButton: HTMLButtonElement;

    constructor(container: HTMLElement, onOrder: () => void) {
        super(container);
        this.listElement = ensureElement<HTMLElement>('.basket__list', this.container);
        this.totalElement = ensureElement<HTMLElement>('.basket__price', this.container);
        this.orderButton = ensureElement<HTMLButtonElement>('.basket__button', this.container);

        this.orderButton.addEventListener('click', onOrder);
    }

    set items(items: HTMLElement[]) {
        if (items.length === 0) {
            this.listElement.innerHTML = '<p style="text-align: center">Корзина пуста</p>';
            this.orderButton.disabled = true;
        } else {
            this.listElement.replaceChildren(...items);
            this.orderButton.disabled = false;
        }    
    }   

    set total(value: number) {
        this.totalElement.textContent = `${value} синапсов`;
    }
}
import { ensureElement } from "../../utils/utils";
import { IProduct } from "../../types";
import { Card } from "./Card";
import { categoryMap } from "../../utils/constants";

export class CardPreview extends Card<IProduct> {
    protected categoryElement: HTMLElement;
    protected imageElement: HTMLImageElement;
    protected descriptionElement: HTMLElement;
    protected buttonElement: HTMLButtonElement;

    constructor(container: HTMLElement, onBuy: () => void) {
        super(container);
        this.categoryElement = ensureElement<HTMLElement>('.card__category', this. container);
        this.imageElement = ensureElement<HTMLImageElement>('.card__image', this.container);
        this.descriptionElement = ensureElement<HTMLElement>('.card__text', this.container);
        this.buttonElement = ensureElement<HTMLButtonElement>('.card__button', this.container);

        this.buttonElement.addEventListener('click', onBuy);
    }

    set category(value:string) {
        this.categoryElement.textContent = value;
        this.categoryElement.className = 'card__category';
        const categoryClass = categoryMap[value as keyof typeof categoryMap];
        if (categoryClass) {
            this.categoryElement.classList.add(categoryClass);
        }
        
    }

    set image(value:string) {
        this.setImage(this.imageElement, value, this.titleElement.textContent || 'Товар');
    }

    set description(value: string) {
        this.descriptionElement.textContent = value;
    }

    set buttonText(value: string) {
        this.buttonElement.textContent = value;
    }

    set buttonDisabled(value: boolean) {
        this.buttonElement.disabled = value;
    }
}
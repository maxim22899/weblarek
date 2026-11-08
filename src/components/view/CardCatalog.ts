import { ensureElement } from "../../utils/utils";
import { IProduct } from "../../types";
import { Card } from "./Card";
import { categoryMap } from "../../utils/constants";

export class CardCatalog extends Card<IProduct> {
    protected categoryElement: HTMLElement;
    protected imageElement: HTMLImageElement;

    constructor(container: HTMLElement, onClick: () => void) {
        super(container);
        this.categoryElement = ensureElement<HTMLElement>('.card__category', this.container);
        this.imageElement = ensureElement<HTMLImageElement>('.card__image', this.container);

        this.container.addEventListener('click', onClick);
    }

    set category(value:string) {
        this.categoryElement.textContent = value;
        this.categoryElement.className = 'card__category';
        const categoryClass = categoryMap[value as keyof typeof categoryMap];
        if (categoryClass) {
            this.categoryElement.classList.add(categoryClass);
        }
        
    }

    set image(value: string) {
        this.setImage(this.imageElement, value, this.titleElement.textContent || 'Товар');
    }
}
import { ensureElement } from '../../utils/utils';
import { IProduct } from '../../types';
import { Card } from './Card';
import { IEvents } from '../base/Events';

export class CardBasket extends Card<IProduct> {
    protected indexElement: HTMLElement;
    protected deleteButton: HTMLButtonElement;
    protected itemId: string = ''; 

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);
        this.indexElement = ensureElement<HTMLElement>('.basket__item-index', this.container);
        this.deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', this.container);

        this.deleteButton.addEventListener('click', () => {
            this.events.emit('basket:remove', { id: this.itemId });
        });
    }

    set index(value: number) {
        this.indexElement.textContent = String(value);
    }
    set id(value: string) {
        this.itemId = value;
    }
}
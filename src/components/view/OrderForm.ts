import { ensureElement } from '../../utils/utils';
import { IBuyer } from '../../types';
import { IEvents } from '../base/Events';
import { Form } from './Form';

export class OrderForm extends Form<IBuyer> {
    protected cardButton: HTMLButtonElement;
    protected cashButton: HTMLButtonElement;
    protected addressInput: HTMLInputElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(events, container);
        
        this.cardButton = ensureElement<HTMLButtonElement>('button[name="card"]', this.container);
        this.cashButton = ensureElement<HTMLButtonElement>('button[name="cash"]', this.container);
        this.addressInput = ensureElement<HTMLInputElement>('input[name="address"]', this.container);

        this.cardButton.addEventListener('click', () => {
            this.events.emit('form:change', { field: 'payment', value: 'card' });
        });
        
        this.cashButton.addEventListener('click', () => {
            this.events.emit('form:change', { field: 'payment', value: 'cash' });
        });

        this.container.addEventListener('submit', (e) => {
            e.preventDefault();
            this.events.emit('order:submit');
        });
    }

    set payment(value: string) {
        this.cardButton.classList.toggle('button_alt-active', value === 'card');
        this.cashButton.classList.toggle('button_alt-active', value === 'cash');
    }

    set address(value: string) {
        this.addressInput.value = value;
    }
}
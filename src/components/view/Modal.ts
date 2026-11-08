import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/Events";

interface IModalData {
    content: HTMLElement;
}

export class Modal extends Component<IModalData> {
    protected closeButton: HTMLButtonElement;
    protected contentElement: HTMLElement;

    constructor(protected events: IEvents, container: HTMLElement) {
        super(container);
        this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', this.container);
        this.contentElement = ensureElement<HTMLElement>('.modal__content', this.container);

        this.closeButton.addEventListener('click', () => {
            this.events.emit('modal:close');
        });

        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) {
                this.events.emit('modal:close');
            }
        });
    }

        open(content: HTMLElement): void {
            this.contentElement.replaceChildren(content);
            this.container.classList.add('modal_active');
        }

        close(): void {
            this.container.classList.remove('modal_active');
            this.contentElement.replaceChildren();
        }

        set content(value: HTMLElement) {
            this.contentElement.replaceChildren(value);
        }
    }
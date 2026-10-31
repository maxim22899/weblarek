import { IApi, IOrder, IOrderResult, IProductsResponse } from "../../types";
import { API_URL } from "../../utils/constants";

export class LarekApi {
  private api: IApi;

  constructor(api: IApi) {
    this.api = api;
  }

  getProducts(): Promise<IProductsResponse> {
    return this.api.get<IProductsResponse>(`${API_URL}/product/`);
  }

  postOrder(order: IOrder): Promise<IOrderResult> {
    return this.api.post<IOrderResult>(`${API_URL}/order/`, order);
  }
}

/**
 * AppDevResponse - the response from an HTTP request
 *
 * Wraps a `success` field around the response data
 */
export class AppDevResponse<T> {
    success: boolean;
    data: T;

    constructor(success: boolean, data: T) {
        this.success = success;
        this.data = data;
    }
}

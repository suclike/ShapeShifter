export default class WorkerMessenger {
  private _requestId: number;
  private _pending: any;
  private _url: string;
  private _worker: Worker;

  constructor(url) {
    this._requestId = 0;
    // Worker jobs awaiting response { [requestId]: [ resolve, reject ] }
    this._pending = {};
    this._url = url;
    this._worker = null;
  }

  async release() {
    if (this._worker) {
      this._worker.terminate();
      this._worker = null;
    }
    Object.keys(this._pending).forEach(id => {
      this._fulfillPending(
        id,
        null,
        new Error("Worker terminated: " + this._url)
      );
    });
  }

  _postMessage(message) {
    if (!this._worker) {
      this._worker = new Worker(this._url);
      this._worker.onmessage = event => {
        this._onMessage(event);
      };
    }

    this._worker.postMessage(message);
  }

  _onMessage(event) {
    if (!event.data.id) {
      console.log("Unexpected message", event);
      return;
    }

    this._fulfillPending(event.data.id, event.data.result, event.data.error);
  }

  _fulfillPending(id, result, error) {
    const resolver = this._pending[id];

    if (!resolver) {
      console.log("No resolver for", { id, result, error });
      return;
    }

    delete this._pending[id];

    if (error) {
      resolver[1](new Error(error));
      return;
    }

    resolver[0](result);
  }

  _requestResponse(message): Promise<any> {
    return new Promise((resolve, reject) => {
      message.id = ++this._requestId;
      this._pending[message.id] = [resolve, reject];
      this._postMessage(message);
    });
  }
}

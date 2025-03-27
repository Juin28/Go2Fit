export function resolvePromise(prms, promiseState) {

    if (!prms) {
        promiseState.promise = null
        promiseState.data = null
        promiseState.error = null
        return
    }

    if (!promiseState) {
        promiseState = {}
    }

    promiseState.promise = prms;
    promiseState.data = null;
    promiseState.error = null;

    function successACB(result) {
        if (promiseState.promise === prms) {
            promiseState.data = result
        }
    }

    function errorACB(error) {
        if (promiseState.promise === prms) {
            promiseState.error = error
        }
    }

    prms.then(successACB).catch(errorACB)
}
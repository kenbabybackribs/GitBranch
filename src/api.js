'use strict';

export async function fetchData(url, successCallback, errorCallback) {
    try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(response.message)
        const data = await response.json()
        successCallback(data)

    } catch (err) {
        errorCallback(err)
    }
}
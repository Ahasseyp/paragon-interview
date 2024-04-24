function sleep(timeout: number) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, timeout);
    });
}

function backoff(func: Function, options: any):Function {
    // todo implement me (fix types as needed)
    let currentRetry = 1;
    let waitingTime = options.initialDelay;

    let fPrime = (a: number, b: number) => {
        return func(a, b)
            .then((value: number) => {
                return value
            })
            .catch(() => {
                console.log(`This is retry number ${currentRetry}`);
                console.log(`Waiting ${waitingTime}`, Date.now())
                sleep(waitingTime).then(() => {
                    waitingTime *= 2;
                    currentRetry++;
                    if (currentRetry > options.maxAttempts) {
                        throw new Error("Max attempts reached");
                    }
                    return fPrime(a, b)
                })
            })
    }
    return fPrime
}

async function unreliableSum(a: number, b: number): Promise<number> {
	if (Math.random() > 0.99) {
		return a + b;
	}
	throw new Error("Unlucky!");
}

let unreliableSumWithBackoff = backoff(unreliableSum, {
	maxAttempts: 5,
	initialDelay: 50
});

unreliableSumWithBackoff(2, 2).then(console.log); // -> Should eventually return 4.

// Example trace:
// ------------------------------------------
// - Call unreliableSum with args (a: 2, b: 2).
// - unreliableSum fails, so we wait 50ms.
// - Call unreliableSum again.
// - unreliableSum fails, so we wait 100ms.
// - Call unreliableSum again.
// - unreliableSum fails, so we wait 200ms.
// - Call unreliableSum again.
// - unreliableSum resolves to 4.
// - Resolve with/return 4.

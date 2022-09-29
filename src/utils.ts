export function isString(value: any): boolean {
  return typeof value === 'string' || value instanceof String;
}

export function isNullOrWhitespace(value: any): boolean {
  if (!isString(value)) {
    return true;
  } else {
    return value === null || value === undefined || value.trim() === '';
  }
}

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function waitFor(conditionFn: () => Promise<boolean>, description = '', pollInterval = 1000) {
  process.stdout.write(description);
  const poll = (resolve: any) => {
    conditionFn().then((result) => {
      if (result) {
        console.log(' OK');
        resolve();
      } else {
        process.stdout.write('.');
        setTimeout(_ => poll(resolve), pollInterval);
      }
    }).catch(() => {
      process.stdout.write('.');
      setTimeout(_ => poll(resolve), pollInterval);
    });
  }
  return new Promise(poll);
}


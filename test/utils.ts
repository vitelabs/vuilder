import { expect } from "chai";

export const expectThrowsAsync = async (method: any, errorMessage: string) => {
  let error: any = null;
  try {
    await method();
  }
  catch (err) {
    error = err;
  }
  expect(error).to.be.an('Error');
  if (errorMessage) {
    expect(error.message).to.equal(errorMessage);
  }
}
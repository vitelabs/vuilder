import fs from "fs";
import path from "path";
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

export const writeFile = (fsPath: string, name: string, data: any, encoding?: BufferEncoding) => {
  if (!fs.existsSync(fsPath)) {
    fs.mkdirSync(fsPath, { recursive: true })
  }
  return fs.writeFileSync(path.join(fsPath, name), data, encoding);
}
import xml2js from "xml2js";

export const parseXml = async (xml: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser();

    parser.parseString(xml, (err, result) => {
      if (err) {
        return reject(err);
      }

      return resolve(result);
    });
  });
};

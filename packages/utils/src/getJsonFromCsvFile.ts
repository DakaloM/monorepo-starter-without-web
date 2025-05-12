import csvtojson from "csvtojson";

export function getJsonFromCsvFile (file: string){
  const data = csvtojson().fromFile(file).then((jsonList: any) => {
    return jsonList;
  });

  return data;
}
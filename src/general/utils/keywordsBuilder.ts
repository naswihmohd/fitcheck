function keywordsBuilder(term: string): string[] {
  const caseSearchList: string[] = [];
  let temp = "";

  const nameSplits = term.split(" ");
  for (let i = 0; i < nameSplits.length; i++) {
    let name = "";

    for (let k = i; k < nameSplits.length; k++) {
      name += `${nameSplits[k]} `;
    }
    temp = "";

    for (let j = 0; j < name.length; j++) {
      temp += name[j];
      caseSearchList.push(
        temp
          .toLowerCase()
          .replace(/\s/g, "")
      );
    }
  }

  return Array.from(new Set(caseSearchList.filter((element) => element !== "")));
};

// converted to ts from the dart version of keywordsBuilder
export default keywordsBuilder;
const fs = require('fs');
const juice = require('juice');
const pretty = require('pretty');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})
var filesToParse = [];
var filesValid = true;
var initialString = '';
var totalImports = 0;
var rootHtmlPath = 'html'

function checkifFileExists(filePath) {
    return new Promise((resolve, reject) => {
        fs.access(filePath, fs.F_OK, (err) => {
            if (err) {
                console.error(err)
                return reject(err);
            }
            //file exists
            resolve();
        })
    });
}

function init(fileName) {
    return readFileContents(fileName).then((data) => {
        // if (err) throw err;
        initialString = data;
        // resolve();
        return countImports(initialString, fileName);
    }).catch(err => {
        reject();
        throw err;
    });
}

function countImports(fileAsString, fileName) {
    let startSymbol = search("${", fileAsString);
    // console.log('startSymbol: ', startSymbol);
    let endSymbol = search("}$", fileAsString);
    // console.log('endSymbol: ', endSymbol);
    if (checkIfProperImports(startSymbol.count, endSymbol.count)) {
        totalImports = startSymbol.count;
        if (totalImports > 0) {
            console.log(`\n--------------- A total of (${totalImports}) ${totalImports === 1 ? 'import' : 'imports'} found in '${fileName}'---------------\n`)
            var finalArray = startSymbol.indexes.concat(endSymbol.indexes).sort((a, b) => {
                return a - b
            });
            // console.log(finalArray);
            return parse(fileAsString, fileName); // start parsing..
        } else {
            console.log(`No imports found in ${fileName}\n`);
        }
    } else {
        console.error('Improper imports');
        throw new Error('Error- Improper imports');
    }
}

function search(symbol, stringToSearchIn = '') {
    let pos = 0;
    let num = -1;
    let i = -1;
    let string = stringToSearchIn;
    let foundIndexes = [];

    // Search the string and counts the number of symbols..
    while (pos != -1) {
        pos = string.indexOf(symbol, i + 1);
        num += 1;
        i = pos;
        pos !== -1 ? foundIndexes.push(pos) : '';
    }
    // console.log(num);
    return {
        count: num,
        indexes: foundIndexes
    };
}

function checkIfProperImports(startCount, endCount) {
    return startCount === endCount;
};
async function parse(stringToReplaceIn, fileName) {
    if (fileName) {
        for (let i = 0; i < totalImports; i++) {
            let match = getImportedFileName(stringToReplaceIn);
            if (match) {
                console.log(`Importing ${match}...\n`);
                let res = await readFileContents(`${rootHtmlPath}/${match.toString().split('./')[1]}`)
                if (res.length) {
                    stringToReplaceIn = replaceString(stringToReplaceIn, res).slice();
                    console.log(`✓✓✓ Imported file '${match}' successfully.\n`);
                    if (i === totalImports - 1) {
                        // writeToFile(stringToReplaceIn, 'o.html');
                        juice.juiceResources(stringToReplaceIn, {
                            preserveImportant: true,
                            preserveMediaQueries: true,
                            webResources: {
                                images: false,
                                relativeTo: `./${rootHtmlPath}`
                            }
                        }, (err, data) => {
                            let prettifiedString = pretty(data, {
                                ocd: true
                            });
                            writeToFile(prettifiedString, `./output/parsed-${getDateString()}-${findFileNameFromPath(fileName)}`);
                            // console.log(prettifiedString);
                        });
                    }
                }
                // });
            } else {
                console.log(`No matching imports found..${stringToReplaceIn}`);
            }

        }
    }
}

function getImportedFileName(str) {
    let startPosition = str.substring(str.indexOf('${'));
    let endPosition = startPosition.replace(/}\$/g, "");
    if (startPosition && endPosition) {
        try {
            return str.trim().split('\${include')[1].split('}\$')[0].trim();
        } catch (e) {
            return null;
        }
    }
}

function findFileNameFromPath(relativePath) {
    let tmp = relativePath.split('/');
    return tmp[tmp.length - 1];
}

function replaceString(searchVal = initialString, replaceValue) {

    let replacedString = searchVal.replace(/\${[\s]*include[\s]*.*html.*}\$/, '\n' + replaceValue) + '';
    // console.log(replacedString);
    return replacedString;

}

function readFileContents(fileName) {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, (err, data) => {
            if (err) {
                reject(err)
                throw new Error(`${fileName} not found`)
            };
            strData = data.toString();
            // console.log(`${fileName} content: ${strData}`);
            resolve(strData);
        })
    })
}

function writeToFile(_content, _filename) {
    return new Promise((resolve, reject) => {
        fs.writeFile(_filename, _content, (err) => {
            if (err) {
                reject(err)
                throw new Error(`${_filename} not found`)
            };
            // console.log(`${fileName} content: ${strData}`);
            resolve(_content);
        })
    })
}

function getDateString() {
    const date = new Date();
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const timestamp = `${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`
    return `${year}-${month}-${day}`
}

// Main()
readline.question(`Please enter one or more file paths(relative) separated by comma. e.g: ./path1/file1.html, ./path2/file2.html\n`, async (fileNames) => {
    filesToParse = fileNames.split(',');
    filesToParse = filesToParse.map(fl => fl.trim());
    console.log(`\nEntered file paths: ${filesToParse}`)
    for (let file of filesToParse) {
        // console.log(file);
        await checkifFileExists(file).catch(() => {
            filesValid = false;
            console.error(`${file} does not exist`);
        })
    }
    if (filesValid) {
        for (let [i, file] of filesToParse.entries()) {
            console.log(`\n\n(${i + 1}) Parsing ${file} please wait...`);
            await init(file);
            console.log(`---------------------- ✓✓✓ Parsed ${file} successfully----------------------\n\n`);
        }
    }
    readline.pause();
});

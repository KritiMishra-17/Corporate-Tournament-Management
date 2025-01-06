const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');

const customConfig = {
    dictionaries: [adjectives, animals, colors],
    separator: '',
    length: 3,
    style: 'capital',

    suffix: () => Math.floor(Math.random() * 100).toString()
};

function generateCodename() {
    return uniqueNamesGenerator(customConfig); // BigRedDog
}

module.exports = generateCodename;
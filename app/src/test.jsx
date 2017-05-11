/**
 * Created by syrel on 11.05.17.
 */

// Lexical arguments
function square() {
    let example = () => {
        let numbers = [];
        for (let number of arguments) {
            numbers.push(number * number);
        }

        return numbers;
    };
    return example();
}

console.log(square(2, 4, 7.5, 8, 11.5, 21)); // returns: [4, 16, 56.25, 64, 132.25, 441]
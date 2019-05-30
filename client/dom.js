let main = () => {

    document.body.style.border = "1px solid red";
    document.body.childNodes[1].childNodes[1].innerText = "test";
    let h1 = document.getElementById("the-heading");
    h1.innerText = "Foobar";
    h1.style.border = "1px solid magenta";

    let firstItem = document.querySelector(".first-item");
    firstItem.style.border = "1px solid white";

    let fourthNode = document.createElement("li");
    fourthNode.innerText = "four";
    firstItem.parentElement.appendChild(fourthNode);

    let lis = document.querySelectorAll("li");
    console.log(lis);
}

let maindelay = () => {
    window.setTimeout(main, 1000)
};

window.addEventListener("load", main);

let countNodes = (aNode) => {
    // Base Case!
    if (aNode.childNodes.length === 0) {
        return 1;
    } else {
        let count = 1;
        for (let i = 0; i < aNode.childNodes.length; i++) {
            count += countNodes(aNode.childNodes[i]);
        }
        return count;
    }
};

console.log(countNodes(document.body));
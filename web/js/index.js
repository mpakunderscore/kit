function on() {
    document.querySelector("#outside").style.backgroundColor = "#3dc7ff";
}

function off() {
    document.querySelector("#outside").style.backgroundColor = "black";
}

function showDescription(block) {
    // console.log(block)
    block.classList.add("stick");
}

function openDescription(block) {
    block = block.nextSibling.nextSibling;
    console.log(block)
    block.style.height = "auto";
}

function load(href) {

    let request = new XMLHttpRequest();
    request.open("GET", href, false);
    request.send();
    return request.responseText;
}

function field(event) {

    // let field = event.target;

    // if (field.textContent.startsWith("Project "))
    //     field.textContent = "";

    // console.log("field");
    // console.log(field.textContent);

    // field.textContent = "";
}

function submit() {

    let fields = document.getElementById("idea").getElementsByClassName("field");

    console.log(fields[0].value)
    console.log(fields[1].innerText)
    // console.log(fields[2].value)

    sendIdea(fields[0].value, fields[1].innerText);

    fields[0].value = "";
    fields[1].innerHTML = ">&nbsp;";
    fields[2].value = "";


}
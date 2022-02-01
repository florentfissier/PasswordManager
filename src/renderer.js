let first_time = true;

function make_enter_possible_in_input_master_passwd() {
  let input = document.getElementById("master");
  input.addEventListener("keyup", function(event) {
    if (event.keyCode == 13) {
      document.getElementById("master-button").click();
    }
  })
}

function show_password() {
  let input = document.getElementById("master");
  input.setAttribute("type", "text");
  let i = document.getElementById("toggle-password");
  i.classList.remove("fa-eye-slash");
  i.classList.add("fa-eye");
  i.setAttribute("onclick", "hide_password()");
}

function hide_password() {
  let input = document.getElementById("master");
  input.setAttribute("type", "password");
  let i = document.getElementById("toggle-password");
  i.classList.remove("fa-eye");
  i.classList.add("fa-eye-slash");
  i.setAttribute("onclick", "show_password()");
}

function show_password_input_pass() {
  let input = document.getElementById("input-pass");
  input.setAttribute("type", "text");
  let i = document.getElementById("toggle-password-input-pass");
  i.classList.remove("fa-eye-slash");
  i.classList.add("fa-eye");
  i.setAttribute("onclick", "hide_password_input_pass()");
}

function hide_password_input_pass() {
  let input = document.getElementById("input-pass");
  input.setAttribute("type", "password");
  let i = document.getElementById("toggle-password-input-pass");
  i.classList.remove("fa-eye");
  i.classList.add("fa-eye-slash");
  i.setAttribute("onclick", "show_password_input_pass()");
}

window.addEventListener('DOMContentLoaded', () => {
  make_enter_possible_in_input_master_passwd();
})

window.api.receive("fromMain", (data) => {
	if (data === "bothExist") {
		document.getElementById("master-password").style.display = "block";
      	document.getElementById("master-para").innerHTML = "Entrez votre mot de passe maître";
      	document.getElementById("master-button").removeAttribute("onclick");
      	document.getElementById("master-button").setAttribute("onclick", "check_master_password_linux()");
      	document.getElementById("master-button").innerHTML = "Se connecter";
	}
	if (data === "pathExists" || data === "noneExist") {
		document.getElementById("master-password").style.display = "block";
	}
})
window.api.send("toMain", "")


window.api.receive("createdPasswd", (data) => {
    document.getElementById("master-password").style.display = "none";
    document.getElementById("main").style.display = "block";
})
function create_master_password_file_linux() {
  var passwd = document.getElementById("master").value;
  if (passwd.length>=8) {
  	window.api.send("createPasswd", passwd);
  }
}

function search_list() {
  let search_bar = document.getElementById("search-bar");
  let filter = search_bar.value.toUpperCase();
  let elements = document.getElementsByClassName("list-element");

  for (let i=0; i<elements.length;i++) {
    let content = elements[i].innerText;
    if (content.toUpperCase().indexOf(filter) > -1) {
      elements[i].style.display = "";
    }
    else {
      elements[i].style.display = "none";
    }
  }
}


function populate_list(data) {
  let container = document.getElementById("infos-list");
  let search_bar = document.createElement("INPUT");
  search_bar.setAttribute("id", "search-bar");
  search_bar.setAttribute("type", "text");
  search_bar.setAttribute("placeholder", "Rechercher...");
  search_bar.setAttribute("onkeyup", "search_list()");
  container.appendChild(search_bar);
  
  for (let i = 1; i< data.length; i++) {
    let div = document.createElement("DIV");
    div.classList.add("list-element");
    if (data[i][1] !== false) {
      let image = document.createElement("IMG");
      image.setAttribute("src", data[i][1]);
      image.setAttribute("width", "20");
      image.setAttribute("height", "20");
      image.setAttribute("draggable", "false");
      div.appendChild(image);
    }
    let span = document.createElement("SPAN");
    if (data[i][1] !== false) {
      span.style.paddingLeft = "20px";
    }
    let onclickvar = "show_element('" + data[i][0] + "')";
    div.setAttribute("onclick", onclickvar);
    span.innerHTML = data[i][0].replace(/_/g, " ");
    div.appendChild(span);
    container.appendChild(div);
  }
}

window.api.receive("checkedPasswd", (data) => {
	if (data[0]) {
		document.getElementById("master-password").style.display = "none";
    document.getElementById("main").style.display = "block";
    document.getElementById("master").value = "";
    populate_list(data);
  }
  else {
    // Afficher un message d'erreur
    document.getElementById("master").value = "";
  }
});
function check_master_password_linux() {
  var passwd = document.getElementById("master").value;
  window.api.send("checkPasswd", passwd); 
}


window.api.receive("firstTime", (data) => {
  if (data) {
    let display_container = document.getElementById("display-container-bottom");
    display_container.innerHTML = "";

    let bottom_button = document.createElement("DIV");
    bottom_button.classList.add("w3-display-left");
    bottom_button.setAttribute("id", "bottom-button");
    let span_add_button = document.createElement("SPAN");
    span_add_button.setAttribute("onclick", "add_element_to_list()");
    span_add_button.setAttribute("id", "add-button");
    span_add_button.innerHTML = "<i class=\"fa fa-plus\"></i> Ajouter un élément"
    bottom_button.appendChild(span_add_button);

    let arrow_add = document.createElement("DIV");
    arrow_add.setAttribute("id", "arrow-add");
    arrow_add.innerHTML = "&#10554;";

    let modify_element = document.createElement("DIV");
    modify_element.setAttribute("id", "modify-element");
    modify_element.classList.add("w3-display-right");
    let span_modify_button = document.createElement("SPAN");
    span_modify_button.setAttribute("id", "modify-button");
    span_modify_button.setAttribute("onclick", "modify_element()");
    span_modify_button.innerHTML = "<i class=\"fas fa-pencil-alt\"></i> Modifier";
    let span_delete = document.createElement("SPAN");
    span_delete.setAttribute("id", "delete-element");
    span_delete.setAttribute("onclick", "delete_element()");
    span_delete.innerHTML = "<i class=\"fas fa-trash\"></i> Supprimer";
    modify_element.appendChild(span_modify_button);
    modify_element.appendChild(span_delete);

    display_container.appendChild(bottom_button);
    display_container.appendChild(arrow_add);
    display_container.appendChild(modify_element);
  }
  else {
    first_time = false;
  }
});
window.api.send("firstTime");

function depopulate_list() {
  document.getElementById("infos-list").innerHTML = "";
}

window.api.receive("addedElement", (data) => {
  document.getElementById("input-wrapper").remove();
  depopulate_list();
  populate_list(data);
  if (first_time) {
    let container = document.getElementById("infos-element");
    let arrow_show_element = document.createElement("DIV");
    arrow_show_element.setAttribute("id", "arrow-show-element");
    arrow_show_element.innerHTML = "&#10554;";
    container.appendChild(arrow_show_element);
  }

  document.getElementById("add-button").setAttribute("onclick", "add_element_to_list()");
});

function create_dir_element(name, url, login, passwd, image, key) {
  let args = [];
  args[0] = name;
  args[1] = url;
  args[2] = login;
  args[3] = passwd;
  args[4] = image;
  args[5] = key;
  window.api.send("addElement", args);
}

function cancel_element() {
  document.getElementById("input-wrapper").remove();
  document.getElementById("add-button").setAttribute("onclick", "add_element_to_list()");
}

function save_element() {
  let inputname = document.getElementById("input-name");
  let wrapper = document.getElementById("input-wrapper");
  let name = inputname.value.replace(/[^a-zA-Z0-9]/g, "_");
  let url = document.getElementById("input-url").value;
  let login = document.getElementById("input-login").value;
  let passwd = document.getElementById("input-pass").value;
  let image = document.getElementById("hidden-input").value;
  let key = document.getElementById("hidden-input-key").value;
  if (document.getElementById("arrow-save-button")) {
    document.getElementById("arrow-save-button").remove()
  }
  create_dir_element(name, url, login, passwd, image, key);
}

function enable_disable_save_button() {
  let empty = false;
  let inputname = document.getElementById("input-name");
  let inputpass = document.getElementById("input-pass");
  let savebutton = document.getElementById("save-button");

  if (inputname.value === "" || inputpass.value === "") {
    empty = true;
  }

  if (empty) {
    savebutton.classList.add("w3-disabled");
    savebutton.disabled = true;
  }
  else {
    savebutton.classList.remove("w3-disabled");
    savebutton.disabled = false;
    if (document.getElementById("arrow-input-name")) {
      document.getElementById("arrow-input-name").remove();
    }
  
    if (document.getElementById("arrow-input-pass")) {
      document.getElementById("arrow-input-pass").remove();
    }
    if (document.getElementById("arrow-save-button")) {
      document.getElementById("arrow-save-button").style.display = "";
    }
  }
}

function generate_random_password() {
  let modal = document.getElementById("generate-random-pass-modal");
  modal.style.display = "initial";
}

function close_generate_random_pass_modal() {
  document.getElementById("output-range-random-password").innerHTML = "8";
  document.getElementById("length-range-gen-pass").setAttribute("value", "8");
  document.getElementById("length-range-gen-pass").value = "8";
  document.getElementById("checkbox-num-random-pass").checked = true;
  document.getElementById("checkbox-spec-random-pass").checked = true;
  document.getElementById("generate-random-pass-modal").style.display = "none";
}

function confirm_gen_random_pass() {
  let length = document.getElementById("length-range-gen-pass").value;
  let chars = "abcdefghijklmnopqrstuvwxyz";
  chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  if (document.getElementById("checkbox-num-random-pass").checked) {
    chars += "0123456789";
  }

  if (document.getElementById("checkbox-spec-random-pass").checked) {
    chars += "#?!&%@=+-*";
  }

  let result = "";

  for (let i=0; i<length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  document.getElementById("input-pass").value = result;
  close_generate_random_pass_modal();
  enable_disable_save_button();
}

function enable_disable_save_button_modify() {
  var empty = false;
  var inputname = document.getElementById("input-name-modify");
  var inputpass = document.getElementById("input-password-modify");
  var savebutton = document.getElementById("confirm-modification-button");

  if (inputname.value === "" || inputpass.value === "") {
    empty = true;
  }

  if (empty) {
    savebutton.classList.add("w3-disabled");
    savebutton.disabled = true;
  }
  else {
    savebutton.classList.remove("w3-disabled");
    savebutton.disabled = false;
  }
}

function generate_random_password_modify() {
  let chars = "abcdefghijklmnopqrstuvwxyz";
  chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  chars += "0123456789";
  chars += "#?!&%@=+-*";

  let length = 20;
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  let inputpass = document.getElementById("input-password-modify");
  inputpass.value = result;
  enable_disable_save_button_modify();
}

function add_element_to_list() {
  if (document.getElementById("arrow-add")) {
    document.getElementById("arrow-add").remove();
  }
  close_show_element();
  document.getElementById("add-button").removeAttribute("onclick");
  document.getElementById("modify-element").style.display = "none";

  let div = document.getElementById("infos-element");
  div.innerHTML = "";
  let wrapper = document.createElement("DIV");
  wrapper.setAttribute("id", "input-wrapper");

  let pname = document.createElement("P");
  pname.innerHTML = "Nom de l'application/site à ajouter";
  let purl = document.createElement("P");
  purl.innerHTML = "URL du site";
  let pimage = document.createElement("P");
  let plogin = document.createElement("P");
  plogin.innerHTML = "Identifiant de connexion";
  let ppass = document.createElement("P");
  ppass.innerHTML = "Mot de passe associé à l'identifiant";

  let inputname = document.createElement("INPUT");
  inputname.setAttribute("type", "text");
  inputname.setAttribute("name", "name");
  inputname.setAttribute("id", "input-name");
  inputname.setAttribute("placeholder", "Nom de l'app");
  inputname.setAttribute("onkeyup", "enable_disable_save_button()");
  inputname.required = true;
  pname.appendChild(inputname);

  let inputURL = document.createElement("INPUT");
  inputURL.setAttribute("type", "text");
  inputURL.setAttribute("name", "url");
  inputURL.setAttribute("id", "input-url");
  inputURL.setAttribute("placeholder", "URL du site");
  purl.appendChild(inputURL);

  let inputLogin = document.createElement("INPUT");
  inputLogin.setAttribute("type", "text");
  inputLogin.setAttribute("name", "login");
  inputLogin.setAttribute("id", "input-login");
  inputLogin.setAttribute("placeholder", "Identifiant");
  plogin.appendChild(inputLogin);

  let imageDiv = document.createElement("DIV");
  imageDiv.setAttribute("id", "image-div");
  let titleImage = document.createElement("H6");
  titleImage.innerText = "Image de l'application";
  let spanImage = document.createElement("SPAN");
  spanImage.setAttribute("id", "selectedImage");
  let iImage = document.createElement("I");
  iImage.setAttribute("id", "remove-image");
  iImage.setAttribute("onclick", "remove_image()");
  iImage.classList.add("w3-btn", "w3-round", "fas", "fa-times");
  iImage.style.display = "none";

  let hiddenInput = document.createElement("INPUT");
  hiddenInput.setAttribute("id", "hidden-input");
  hiddenInput.setAttribute("type", "hidden");
  hiddenInput.value = "";
  let inputImage = document.createElement("BUTTON");
  inputImage.setAttribute("id", "add-image");
  inputImage.classList.add("w3-btn");
  inputImage.setAttribute("onclick", "open_image_dialog()");
  inputImage.innerHTML = "Parcourir";
  imageDiv.appendChild(titleImage);
  imageDiv.appendChild(spanImage);
  imageDiv.appendChild(iImage);
  imageDiv.appendChild(inputImage);
  imageDiv.appendChild(hiddenInput);
  pimage.appendChild(imageDiv);

  let keyDiv = document.createElement("DIV");
  keyDiv.setAttribute("id", "key-div");
  let titleKey = document.createElement("H6");
  titleKey.innerText = "Clé privée";
  let spanKey = document.createElement("SPAN");
  spanKey.setAttribute("id", "selected-key");
  let iKey = document.createElement("I");
  iKey.setAttribute("id", "remove-key");
  iKey.setAttribute("onclick", "remove_key()");
  iKey.classList.add("w3-btn", "w3-round", "fas", "fa-times");
  iKey.style.display = "none";

  let hiddenInputKey = document.createElement("INPUT");
  hiddenInputKey.setAttribute("id", "hidden-input-key");
  hiddenInputKey.setAttribute("type", "hidden");
  hiddenInputKey.value = "";
  let inputKey = document.createElement("BUTTON");
  inputKey.setAttribute("id", "add-key");
  inputKey.classList.add("w3-btn");
  inputKey.setAttribute("onclick", "open_key_dialog()");
  inputKey.innerHTML = "Parcourir";
  keyDiv.appendChild(titleKey);
  keyDiv.appendChild(spanKey);
  keyDiv.appendChild(iKey);
  keyDiv.appendChild(inputKey);
  keyDiv.appendChild(hiddenInputKey);
  pimage.appendChild(keyDiv);


  let inputPass = document.createElement("INPUT");
  inputPass.setAttribute("type", "password");
  inputPass.setAttribute("name", "pass");
  inputPass.setAttribute("id", "input-pass");
  inputPass.setAttribute("placeholder", "Mot de passe");
  inputPass.setAttribute("onkeyup", "enable_disable_save_button()");
  inputPass.required = true;
  ppass.appendChild(inputPass);

  let spanEye = document.createElement("SPAN");
  spanEye.setAttribute("id", "span-eye-input-pass");
  let spanEyeI = document.createElement("I");
  spanEyeI.setAttribute("id", "toggle-password-input-pass");
  spanEyeI.classList.add("fas", "fa-eye-slash");
  spanEyeI.setAttribute("onclick", "show_password_input_pass()");
  spanEye.appendChild(spanEyeI);
  ppass.appendChild(spanEye);

  let generate_random_password = document.createElement("BUTTON");
  generate_random_password.setAttribute("id", "gen-ran-pass-button");
  generate_random_password.setAttribute("onclick", "generate_random_password()");
  generate_random_password.classList.add("w3-btn");
  generate_random_password.innerHTML = "Générer un mot de passe aléatoire"
  ppass.appendChild(generate_random_password);

  let inputButton = document.createElement("BUTTON");
  inputButton.setAttribute("id", "save-button");
  inputButton.classList.add("w3-btn", "w3-block", "w3-green", "w3-disabled");
  inputButton.setAttribute("onclick", "save_element()");
  inputButton.innerHTML = "Enregistrer";
  inputButton.addEventListener("keyup", function(event) {
    if (event.keyCode == 13) {
      document.getElementById("save-button").click();
    }
  });
  inputButton.disabled = true;

  let inputCancel = document.createElement("BUTTON");
  inputCancel.classList.add("w3-btn", "w3-block", "w3-red");
  inputCancel.setAttribute("onclick", "cancel_element()");
  inputCancel.innerHTML = "Annuler"

  wrapper.appendChild(pname);
  wrapper.appendChild(purl);
  wrapper.appendChild(pimage);
  wrapper.appendChild(plogin);
  wrapper.appendChild(ppass);
  wrapper.appendChild(inputButton);
  wrapper.appendChild(document.createElement("BR"));
  wrapper.appendChild(inputCancel);

  if (first_time) {
    let arrow_input_name = document.createElement("DIV");
    arrow_input_name.setAttribute("id", "arrow-input-name");
    arrow_input_name.innerHTML = "&#10554;"
    wrapper.appendChild(arrow_input_name);

    let arrow_input_pass = document.createElement("DIV");
    arrow_input_pass.setAttribute("id", "arrow-input-pass");
    arrow_input_pass.innerHTML = "&#10554;";
    wrapper.appendChild(arrow_input_pass);

    let arrow_save_button = document.createElement("DIV");
    arrow_save_button.setAttribute("id", "arrow-save-button");
    arrow_save_button.innerHTML = "&#10554;"
    arrow_save_button.style.display = "none";
    wrapper.appendChild(arrow_save_button);
  }
  div.appendChild(wrapper);
}

function change_length_gen_pass(val) {
  document.getElementById("output-range-random-password").innerHTML = val;
}

function copy_password_to_clipboard() {
  let copy_password = document.getElementById("disabled-input-passwd");
  navigator.clipboard.writeText(copy_password.value)
}

function remove_image() {
  document.getElementById("selectedImage").innerHTML = "";
  document.getElementById("hidden-input").value = "";
  document.getElementById("remove-image").style.display = "none";
}

function remove_key() {
  document.getElementById("selected-key").innerText = "";
  document.getElementById("hidden-input-key").value = "";
  document.getElementById("remove-key").style.display = "none";
}

window.api.receive("showedElement", (data) => {
  document.getElementById("modify-element").style.display = "initial";
  let div = document.getElementById("infos-element");

  let wrapper = document.createElement("DIV");
  wrapper.setAttribute("id", "wrapper-closer");

  let closer = document.createElement("SPAN");
  closer.setAttribute("id", "closer-show-element");
  closer.setAttribute("onclick", "close_show_element()");
  closer.innerHTML = "&#10006;"
  wrapper.appendChild(closer);
  div.appendChild(wrapper);
  
  let wrapperImage = document.createElement("DIV");
  wrapperImage.setAttribute("id", "wrapper-image");
  
  let image = document.createElement("IMG");
  if (data[4]) {
    image.setAttribute("id", "element-image")
    image.setAttribute("src", data[4]);
    image.setAttribute("width", "200");
    image.setAttribute("height", "200");
    image.setAttribute("draggable", "false");
    wrapperImage.appendChild(image);
    div.appendChild(wrapperImage);
  }

  let titre = document.createElement("H3");
  titre.setAttribute("id", "element-title");
  titre.innerHTML = data[0].replace(/_/g, " ");
  div.appendChild(titre);

  if (data[5]) {
    let hasKey = document.createElement("DIV");
    hasKey.setAttribute("id", "has-key");
    let imgKey = document.createElement("IMG");
    imgKey.setAttribute("src", "../assets/icons/key.png");
    imgKey.setAttribute("width", "25px");
    imgKey.setAttribute("height", "25px");
    let spanKey = document.createElement("SPAN");
    spanKey.innerText = data[6];
    let hiddenInputKeyPath = document.createElement("INPUT");
    hiddenInputKeyPath.setAttribute("id", "hidden-input-key-path");
    hiddenInputKeyPath.setAttribute("type", "hidden");
    hiddenInputKeyPath.value = data[7];
    hasKey.appendChild(imgKey);
    hasKey.appendChild(spanKey);
    hasKey.appendChild(hiddenInputKeyPath);
    div.appendChild(hasKey);
  }
  else {
    titre.style.paddingBottom = "72px";
  }

  let table = document.createElement("TABLE");
  let firstrow = document.createElement("TR");
  firstrow.classList.add("row-bottom-bordered");
  let secondrow = document.createElement("TR");
  secondrow.classList.add("row-bottom-bordered");
  let thirdrow = document.createElement("TR");
  let cell1 = document.createElement("TD");
  cell1.classList.add("left-hand-cells");
  cell1.innerHTML = "URL";
  let cell2 = document.createElement("TD");
  cell2.setAttribute("id", "url-cell");
  cell2.classList.add("right-hand-cells");
  cell2.innerHTML = data[1];
  if (data[1] !== "") {
    let urlClickVar = "open_url('" + data[1] + "')";
    cell2.setAttribute("onclick", urlClickVar);
    cell2.style.cursor = "pointer";
  }
  firstrow.appendChild(cell1);
  firstrow.appendChild(cell2);

  let cell3 = document.createElement("TD");
  cell3.classList.add("left-hand-cells");
  cell3.innerHTML = "Identifiant";
  secondrow.appendChild(cell3);
  let cell4 = document.createElement("TD");
  cell4.setAttribute("id", "id-cell");
  cell4.classList.add("right-hand-cells");
  cell4.innerHTML = data[2];
  secondrow.appendChild(cell4);

  let cell5 = document.createElement("TD");
  cell5.classList.add("left-hand-cells");
  cell5.innerHTML = "Mot de passe";
  thirdrow.appendChild(cell5);
  let cell6 = document.createElement("TD");
  cell6.setAttribute("id", "password-cell");
  cell6.classList.add("right-hand-cells");
  let passwd = document.createElement("INPUT");
  passwd.setAttribute("type", "password");
  passwd.setAttribute("id", "disabled-input-passwd");
  passwd.value = data[3];
  passwd.disabled = true;
  cell6.appendChild(passwd);
  let cellcopy1 = document.createElement("SPAN");
  cellcopy1.setAttribute("id", "copy-password");
  cellcopy1.setAttribute("onclick", "copy_password_to_clipboard()");
  cellcopy1.style.cursor = "pointer";
  cellcopy1.innerHTML = "<i class=\"fas fa-copy\"></i>";
  cell6.appendChild(cellcopy1);
  thirdrow.appendChild(cell6);

  table.appendChild(firstrow);
  table.appendChild(secondrow);
  table.appendChild(thirdrow);
  div.appendChild(table);

  if (first_time) {
    let arrow_close_show_element = document.createElement("DIV");
    arrow_close_show_element.setAttribute("id", "arrow-close-show-element");
    arrow_close_show_element.innerHTML = "&#10554;";
    div.appendChild(arrow_close_show_element);
  }
});

function show_element(filename) {
  close_show_element();
  if (document.getElementById("arrow-show-element")) {
    document.getElementById("arrow-show-element").remove();
  }
  window.api.send("showElement", filename);
}

function close_show_element() {
  if (document.getElementById("arrow-close-show-element")) {
    document.getElementById("arrow-close-show-element").remove();
    first_time = false;
  }
  if (document.getElementById("element-title")) {
    let filename = document.getElementById("element-title").innerHTML.replace(/ /g, "_");
    window.api.send("closeElement", filename);
  }
  document.getElementById("infos-element").innerHTML = "";
  document.getElementById("add-button").setAttribute("onclick", "add_element_to_list()");
  document.getElementById("modify-element").style.display = "none";
}


window.api.receive("chosenImage", (data) => {
  let hiddenInput = document.getElementById("hidden-input");
  if ((data !== undefined && hiddenInput.value !== "") || (data !== undefined && hiddenInput.value === "")) {
    let spanImage = document.getElementById("selectedImage");
    spanImage.innerHTML = "";
    hiddenInput.value = data;
    let image = document.createElement("IMG");
    image.setAttribute("src", data);
    image.setAttribute("width", "50");
    image.setAttribute("height", "50");
    image.setAttribute("draggable", "false");
    spanImage.appendChild(image);
    document.getElementById("remove-image").style.display = "initial";
  }
})
function open_image_dialog() {
  window.api.send("chooseImage", "");
}

window.api.receive("chosenKey", (data) => {
  let hiddenInput = document.getElementById("hidden-input-key");
  let index = 0;
  if ((data !== undefined && hiddenInput.value !== "") || (data !== undefined && hiddenInput.value === "")) {
    let res = data.toString();
    if (res.includes("\\")) {
      for (let i = res.length - 1; i>=0; i--) {
        if (res[i] === "\\" && index === 0) {
          index = i
        }
      }
    }
    let spanKey = document.getElementById("selected-key");
    spanKey.innerHTML = "";
    hiddenInput.value = data;
    let revIndex = (res.length) - (res.length - index - 1);
    let print = res.substring(revIndex);
    spanKey.innerText = print;
    document.getElementById("remove-key").style.display = "initial";
  }
});
function open_key_dialog() {
  window.api.send("chooseKey", "");
}


window.api.receive("openedURL", (data) => {
  console.log(data);
});
function open_url(url) {
  if (url.includes("http")) {
    window.api.send("openURL", url);
  }
  else if (url.includes("putty.exe")) {
    let args = [];
    args[0] = document.getElementById("element-title").innerHTML;
    args[1] = url;
    window.api.send("openPutty", args);
  }
  else if (url.includes("ssh")) {
    let args = [];
    args[0] = document.getElementById("element-title").innerHTML;
    args[1] = url.replace("ssh ", "");
    window.api.send("openSSH", args);
  }
  else {
    window.api.send("openFileFromURL", url);
  }
}


function cancel_deletion() {
  document.getElementById("element-to-del").innerHTML = "";
  document.getElementById("delete-element-modal").style.display = "none";
}

function open_delete_modal(element) {
  document.getElementById("delete-element-modal").style.display = "block";
  document.getElementById("element-to-del").innerHTML = element;
  let confirm = document.getElementById("confirm-deletion");
  let sanitized_element = element.replace(/ /g, "_");
  let onclickvar = "confirm_deletion('" + sanitized_element + "')";
  confirm.setAttribute("onclick", onclickvar);
  let cancel_deletion = document.getElementById("cancel-deletion");
  cancel_deletion.setAttribute("onclick", "cancel_deletion()");
}

function delete_element() {
  open_delete_modal(document.getElementById("element-title").innerHTML);
}

window.api.receive("deleted", (data) => {
  depopulate_list();
  populate_list(data);
  document.getElementById("infos-element").innerHTML = "";
  document.getElementById("add-button").setAttribute("onclick", "add_element_to_list()");
  document.getElementById("modify-element").style.display = "none";
  document.getElementById("element-to-del").innerHTML = "";
  document.getElementById("delete-element-modal").style.display = "none";
})
function confirm_deletion(element) {
  window.api.send("toDelete", element)
}


function modify_element() {
  document.getElementById("element-to-modify").innerHTML = document.getElementById("element-title").innerHTML;
  document.getElementById("input-name-modify").value = document.getElementById("element-title").innerHTML;
  document.getElementById("input-url-modify").value = document.getElementById("url-cell").innerHTML;
  let image = document.getElementById("element-image");
  if (image !== null) {
    let src = image.getAttribute("src");
    if (src !== "") {
      document.getElementById("remove-image-modify").style.display = "initial";
      let iImage = document.createElement("IMG");
      iImage.setAttribute("src", src);
      iImage.setAttribute("width", "50");
      iImage.setAttribute("height", "50");
      iImage.setAttribute("draggable", "false");
      document.getElementById("span-image-modify").appendChild(iImage);
      document.getElementById("hidden-input-modify").value = src;
    }
  }
  if (document.getElementById("has-key")) {
    document.getElementById("remove-key-modify").style.display = "initial";
    document.getElementById("span-key-modify").innerText = document.getElementById("has-key").innerText;
    document.getElementById("hidden-input-key-modify").value = document.getElementById("hidden-input-key-path").value;
  }
  document.getElementById("input-login-modify").value = document.getElementById("id-cell").innerHTML;
  document.getElementById("input-password-modify").value = document.getElementById("disabled-input-passwd").value;
  document.getElementById("modify-element-modal").style.display = "block";
}

function close_modify_element_modal() {
  document.getElementById("element-to-modify").innerHTML = "";
  document.getElementById("input-name-modify").value = "";
  document.getElementById("input-url-modify").value = "";
  document.getElementById("span-image-modify").innerHTML = "";
  document.getElementById("remove-image-modify").style.display = "none";
  document.getElementById("hidden-input-modify").value = "";
  document.getElementById("span-key-modify").innerHTML = "";
  document.getElementById("remove-key-modify").style.display = "none";
  document.getElementById("hidden-input-key-modify").value = "";
  document.getElementById("input-login-modify").value = "";
  document.getElementById("input-password-modify").value = "";
  document.getElementById("modify-element-modal").style.display = "none";
}

function remove_image_modify() {
  document.getElementById("span-image-modify").innerHTML = "";
  document.getElementById("hidden-input-modify").value = "";
  document.getElementById("remove-image-modify").style.display = "none";
}

function remove_key_modify() {
  document.getElementById("span-key-modify").innerHTML = "";
  document.getElementById("hidden-input-key-modify").value = "";
  document.getElementById("remove-key-modify").style.display = "none";
}

window.api.receive("chosenImageModify", (data) => {
  let hiddenInput = document.getElementById("hidden-input-modify");
  if ((data !== undefined && hiddenInput.value !== "") || (data !== undefined && hiddenInput.value === "")) {
    let spanImage = document.getElementById("span-image-modify");
    spanImage.innerHTML = "";
    hiddenInput.value = data;
    let image = document.createElement("IMG");
    image.setAttribute("src", data);
    image.setAttribute("width", "50");
    image.setAttribute("height", "50");
    image.setAttribute("draggable", "false");
    spanImage.appendChild(image);
    document.getElementById("remove-image-modify").style.display = "initial";
  }
})
function choose_image_modify(){
  window.api.send("chooseImageModify", "");
}

window.api.receive("chosenKeyModify", (data) => {
  let hiddenInput = document.getElementById("hidden-input-key-modify");
  let index = 0;
  if ((data !== undefined && hiddenInput.value !== "") || (data !== undefined && hiddenInput.value === "")) {
    let res = data.toString();
    if (res.includes("\\")) {
      for (let i = res.length - 1; i>=0; i--) {
        if (res[i] === "\\" && index === 0) {
          index = i
        }
      }
    }
    let spanKey = document.getElementById("span-key-modify");
    spanKey.innerHTML = "";
    hiddenInput.value = data;
    let revIndex = (res.length) - (res.length - index - 1);
    let print = res.substring(revIndex);
    spanKey.innerText = print;
    document.getElementById("remove-key-modify").style.display = "initial";
  }
});
function choose_key_modify() {
  window.api.send("chooseKeyModify", "");
}

function show_password() {
  let input = document.getElementById("master");
  input.setAttribute("type", "text");
  let i = document.getElementById("toggle-password");
  i.classList.remove("fa-eye-slash");
  i.classList.add("fa-eye");
  i.setAttribute("onclick", "hide_password()");
}

function hide_password() {
  let input = document.getElementById("master");
  input.setAttribute("type", "password");
  let i = document.getElementById("toggle-password");
  i.classList.remove("fa-eye");
  i.classList.add("fa-eye-slash");
  i.setAttribute("onclick", "show_password()");
}

function show_password_input_pass_modify() {
  document.getElementById("input-password-modify").setAttribute("type", "text");
  document.getElementById('i-modify-modal').classList.remove("fa-eye-slash");
  document.getElementById('i-modify-modal').classList.add("fa-eye");
  document.getElementById('i-modify-modal').setAttribute("onclick", "hide_password_input_pass_modify()");
}

function hide_password_input_pass_modify() {
  document.getElementById("input-password-modify").setAttribute("type", "password");
  document.getElementById('i-modify-modal').classList.remove("fa-eye");
  document.getElementById('i-modify-modal').classList.add("fa-eye-slash");
  document.getElementById('i-modify-modal').setAttribute("onclick", "show_password_input_pass_modify()");
}

window.api.receive("modificationDone", (data) => {
  let name = data[1][1].replace(/_/g, " ");
  depopulate_list();
  populate_list(data[0]);
  show_element(data[1][1]);
  console.log(data);
});
function confirm_modification() {
  let elementToModify = document.getElementById("element-title").innerHTML.replace(/ /g, "_");
  let newName = document.getElementById("input-name-modify").value.replace(/[^a-zA-Z0-9]/g, "_");
  let url = document.getElementById("url-cell").innerHTML;
  let urlModified = document.getElementById("input-url-modify").value;
  let image = document.getElementById("element-image");
  let pathImage = "";
  if (image !== null) {
    pathImage = image.getAttribute("src");
  }
  let pathImageModified = document.getElementById("hidden-input-modify").value;
  let key = "";
  if (document.getElementById("hidden-input-key-path")) {
    key = document.getElementById("hidden-input-key-path").value;
  }
  let keyModified = document.getElementById("hidden-input-key-modify").value;
  let login = document.getElementById("id-cell").innerHTML;
  let loginModified = document.getElementById("input-login-modify").value;
  let passwd = document.getElementById("disabled-input-passwd").value;
  let passwdModified = document.getElementById("input-password-modify").value;
  let argsToSend = [];
  argsToSend[0] = elementToModify;
  argsToSend[1] = newName;
  argsToSend[2] = urlModified;
  if (url === urlModified) {
    argsToSend[2] = ""
  }
  argsToSend[3] = pathImageModified;
  if (pathImageModified === "") {
    argsToSend[3] = "none";
  }
  if (pathImage === pathImageModified) {
    argsToSend[3] = "";
  }
  argsToSend[4] = loginModified;
  if (login === loginModified) {
    argsToSend[4] = ""
  }
  argsToSend[5] = passwdModified;
  if (passwd === passwdModified) {
    argsToSend[5] = "";
  }
  argsToSend[6] = keyModified;
  if(keyModified === "") {
    argsToSend[6] = "none";
  }
  if (key === keyModified) {
    argsToSend[6] = "";
  }

  close_modify_element_modal();
  close_show_element();
  window.api.send("modificationConfirmed", argsToSend);
}
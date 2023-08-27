import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import BigNumber from "bignumber.js";
import televisionAbi from "../contract/television.abi.json";

const ERC20_DECIMALS = 18;
const TelevisionContractAddress = "0x267174CA118F870832Be54C29343b7bdABAD54B8";

let total = new BigNumber(0);
let television = [];
let orders = [];
let contract;
let kit;

class Order {
  constructor(televisionId, count) {
    this.televisiond = televisionId;
    this.count = count;
  }
}

function notification(_text) {
  document.querySelector(".alert").style.display = "block";
  document.querySelector("#notification").textContent = _text;
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none";
}

const getUser = async function () {
  let username = prompt("Enter Your Preferable Name", "Guest");
  setTimeout(() => {
    let time = new Date();
    if (time.getHours() < 12 && time.getHours() >= 0) {
      notification(
        "Good Morning " +
          username +
          ", Hello.. Good Morning thanks for visiting this site... we present to you the best affrodable Tv u can possibly buy with great features."
      );
    } else if (time.getHours() >= 12 && time.getHours() <= 18) {
      notification(
        "Good Afternoon " +
          username +
          ", Hello.. Good Afternoon thanks for visiting this site... we present to you the best affrodable Tv u can possibly buy with great features."
      );
    } else if (time.getHours() >= 18 && time.getHours() <= 23) {
      notification(
        "Good Evening " +
          username +
          ", Hello.. Good Evening thanks for visiting this site... we present to you the best affrodable Tv u can possibly buy with great features."
      );
    } else if (time.getHours() >= 23 && time.getHours() < 24) {
      notification(
        "Hello " +
          username +
          ", Oh, It's Night time already... thanks for visiting this site... we present to you the best affrodable Tv u can possibly buy with great features."
      );
    }
  }, 3000);
};

const getBalance = async function () {
  notification("⌛ Getting Balance...");
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount);
  const CELOBalance = totalBalance.CELO.shiftedBy(-ERC20_DECIMALS).toFixed(2);
  document.querySelector("#balance").textContent = CELOBalance;
};

const connectCeloWallet = async function () {
  if (window.celo) {
    notification("⚠️ Please approve this DApp to use it.");
    try {
      await window.celo.enable();
      notificationOff();

      const web3 = new Web3(window.celo);
      kit = newKitFromWeb3(web3);

      const accounts = await kit.web3.eth.getAccounts();
      kit.defaultAccount = accounts[0];

      contract = new kit.web3.eth.Contract(televisionAbi, televisionContractAddresstractAddress);
      await getBalance();
      await getUser();
      await getTelevisions();
      setTimeout(() => {
        notificationOff();
      }, 10000);
    } catch (error) {
      notification(`⚠️ ${error}.`);
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.");
  }
};

const getTelevisions = async function () {
  if (contract) {
    notification("⌛ Getting Televisions...");
    const _televisionLength = await contract.methods.getTelevisionslength().call();
    const _televisions = [];
    for (let i = 0; i < _televisionLength; i++) {
      let _television = new Promise(async (resolve, reject) => {
        let p = await contract.methods.getTelevision(i).call();
        resolve({
          index: i,
          name: p[0],
          image: p[1],
          price: new BigNumber(p[2]),
          sold: p[3],
        });
      });
      _televisions.push(_television);
    }
    televisions = await Promise.all(_televisions);
    showMenu();
    notificationOff();
  }
};

function showMenu() {
  document.getElementById("menu").innerHTML = "";
  televisions.forEach((_television) => {
    const newDiv = document.createElement("div");
    newDiv.className = "maincard";
    newDiv.innerHTML = televisionTemplate(_television);
    document.getElementById("menu").appendChild(newDiv);
  });
}

function televisionTemplate(_television) {
  return `
    <div>
      <div class="maincard-img">
        <img src="${_television.image}" alt="" />
        <div style="position: fixed"> 
          <div class="position-absolute top-0 end-0 bg-warning mt-4 px-2 py-1 rounded-start sold">
          ${_television.sold} Sold
          </div>
        </div>
      </div>
      <div class="maincardtext">${_television.name}</div>
      <div class="maprice">${_television.price
        .shiftedBy(-ERC20_DECIMALS)
        .toFixed(2)} CELO per piece</div>
      <button
        class="mbutton addToCart"
        style="text-align: center !important;"
        id="mbtn${_television.index}"
      >
        Add to Cart
      </button>
      <div
        id="item${_television.index}"
        class="Reitem"
        style="
          display: none;
          flex-wrap: wrap;
          justify-content: space-evenly;
          width: 100%;
          font-size: 35px;
        "
      >
        <div
          id="p${_television.index}"
          class="p add"
        >
          <span id="p${_television.index}" class="p add">+</span>
        </div>
        <div class="display" id="counter${_television.index}">0</div>
        <div
          id="m${_television.index}"
          class="m sub"
        >
          <span id="m${_television.index}" class="m sub">-</span>
        </div>
      </div>
    </div>
  `;
}

function addToCart(televisionId, price) {
  let a = document.getElementById("amtbtn");
  let b = document.getElementById(`counter${televisionId}`);
  let c = document.getElementById(`item${televisionId}`);
  let d = document.getElementById(`mbtn${televisionId}`);
  d.style.display = "none";
  c.style.display = "flex";
  b.innerHTML = parseInt(b.innerHTML) + 1;
  total = total.plus(price);
  a.innerHTML = total.shiftedBy(-ERC20_DECIMALS).toFixed(2);
  const order = new Order(Number(televisionId), 1);
  orders.push(order);
}

function updateCount(televisionId, ele, price) {
  let b = document.getElementById(`counter${televisionId}`);
  let c = document.getElementById(`item${televisionId}`);
  let d = document.getElementById(`mbtn${televisionId}`);
  if (parseInt(b.innerHTML) > 0) {
    b.innerHTML = parseInt(b.innerHTML) + ele;
    let a = document.getElementById("amtbtn");
    total = total.plus(price);
    a.innerHTML = total.shiftedBy(-ERC20_DECIMALS).toFixed(2);

    const update = orders.map((television) =>
      television.televisionId === Number(televisionId)
        ? { ...television, count: television.count + ele }
        : television
    );
    orders = update;
  }
  if (parseInt(b.innerHTML) == 0) {
    let array = orders.filter((television) => television.televisionId !== Number(televisionId));
    orders = array;
    c.style.display = "none";
    d.style.display = "inline";
  }
}

async function pay() {
  if (total < 0) return;
  let reference = Math.random() * 10000000;
  let d = parseInt(reference);

  console.log(orders);

  try {
    await contract.methods
      .placeOrder(orders)
      .send({ from: kit.defaultAccount, value: total });
    await getBalance();
    await getTelevisions();
    notification(
      `🎉 Payment made placed successfully, Your order will be delivered shortly with reference number: QO${d}`
    );
    orders = [];
    return true;
  } catch (error) {
    notification(`⚠️ ${error}.`);
    return false;
  }
}

document.querySelector("#newTelevisionBtn").addEventListener("click", async (e) => {
  const params = [
    document.getElementById("newTelevisionName").value,
    document.getElementById("newImgUrl").value,
    new BigNumber(document.getElementById("newPrice").value)
      .shiftedBy(ERC20_DECIMALS)
      .toString(),
  ];
  if (params[2] < 0) return;

  notification(`⌛ Adding "${params[0]}"...`);
  try {
    const result = await contract.methods
      .addNewTelevision(...params)
      .send({ from: kit.defaultAccount });
  } catch (error) {
    notification(`⚠️ ${error}.`);
  }
  notification(`🎉 You successfully added "${params[0]}".`);
  getTelevisions();
});

document.querySelector("#explore").addEventListener("click", async (e) => {
  let show = document.getElementById("intca");
  if (show.style.display != "none") {
    show.style.display = "none";
  } else {
    show.style.display = "flex";
  }
});

document.querySelector("#payBtn").addEventListener("click", async (e) => {
  notification(`⌛ Placing your orders...`);
  let successful = await pay();

  if (!successful) {
    notification(`⚠️ Payment not successful, Please try again.`);
  } else {
    total = new BigNumber(0);
    let a = document.getElementsByClassName("Reitem");
    let b = document.getElementsByClassName("mbutton");
    let c = document.getElementsByClassName("display");
    let e = document.getElementById("amtbtn");
    e.innerHTML = total;
    for (let i = 0; i < a.length; i++) {
      a[i].style.display = "none";
    }
    for (let j = 0; j < b.length; j++) {
      b[j].style.display = "inline";
    }
    for (let j = 0; j < c.length; j++) {
      c[j].innerHTML = 0;
    }
  }
});

document.querySelector("#menu").addEventListener("click", async (e) => {
  if (e.target.className.includes("addToCart")) {
    const index = e.target.id;
    const id = index.match(/(\d+)/);
    addToCart(id[0], televisions[id[0]].price);
  } else if (e.target.className.includes("add")) {
    const index = e.target.id;
    const id = index.match(/(\d+)/);
    updateCount(id[0], 1, televisions[id[0]].price);
  } else if (e.target.className.includes("sub")) {
    const index = e.target.id;
    const id = index.match(/(\d+)/);
    updateCount(id[0], -1, -televisions[id[0]].price);
  }
});

window.addEventListener("load", async () => {
  notification("⌛ Loading...");
  await connectCeloWallet();
});

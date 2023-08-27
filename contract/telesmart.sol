// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

contract Television {
    address private owner;
    uint256 private televisionsLength = 0;

    struct Order {
        uint256 televisionId;
        uint256 count;
    }

    struct TelevisionInfo {
        string name;
        string image;
        uint256 price;
        uint256 sold;
    }

    mapping(uint256 => TelevisionInfo) private televisions;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addNewTelevision(
        string memory _name,
        string memory _image,
        uint256 _price
    ) public onlyOwner {
        require(_price > 0, "Price must be greater than 0");
        televisions[televisionsLength] = TelevisionInfo(_name, _image, _price, 0);
        televisionsLength++;
    }

    function placeOrder(Order[] memory _orders) public payable {
        uint256 totalAmount;
        for (uint256 i = 0; i < _orders.length; i++) {
            Order memory _order = _orders[i];
            TelevisionInfo storage _television = televisions[_order.televisionId];
            require(_television.price > 0, "Television does not exist");
            totalAmount += _television.price * _order.count;
            _television.sold += _order.count;
        }
        require(totalAmount == msg.value, "Invalid amount sent");
        (bool success, ) = owner.call{value: msg.value}("");
        require(success, "Transfer of order amount failed");
    }

    function getTelevision(uint256 _index)
        public
        view
        returns (
            string memory,
            string memory,
            uint256,
            uint256
        )
    {
        TelevisionInfo storage tv = televisions[_index];
        return (tv.name, tv.image, tv.price, tv.sold);
    }

    function getTelevisionsLength() public view returns (uint256) {
        return televisionsLength;
    }
}

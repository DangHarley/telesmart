// SPDX-License-Identifier: MIT

/** @title Television contract
 *  @notice Contract in charge of the Television marketplace
 */
pragma solidity >=0.7.0 <0.9.0;

contract Television {
    uint256 internal televisionsLength = 0;
    address internal owner;

    struct Order {
        uint256 televisionId;
        uint256 count;
    }

    struct Television {
        string name;
        string image;
        uint256 price;
        uint256 sold;
    }

    // mapping of television ids to the television details
    mapping(uint256 => Television) internal televisions;

    // mapping to show if television exists
    mapping(uint256 => bool) internal televisionExists;

    /**
     * @notice Constructor that sets owner to who deploys the contract
     */
    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice adds new television to television contract
     * @param _name: television name
     * @param _image: television image
     * @param _price: television price
     */
    function addNewTelevision(
        string memory _name,
        string memory _image,
        uint256 _price
    ) public {
        require(_price > 0, "Price must be greater than 0");
        uint256 _sold = 0;
        televisions[televisionsLength] = Television(_name, _image, _price, _sold);
        televisionExists[televisionsLength] = true;
        televisionsLength++;
    }

    /**
     * @notice places orders
     * @param _orders: pizza order
     */
    function placeOrder(Order[] memory _orders) public payable {
        uint256 _totalAmount;
        for (uint256 i = 0; i < _orders.length; i++) {
            Order memory _order = _orders[i];
            Television storage _television = televisions[_order.televisionId];
            require(televisionExists[_order.televisionId] == true, "Television does not exist");
            _totalAmount += _television.price * _order.count;
            _television.sold += _order.count;
        }
        require(_totalAmount == msg.value, "Invalid Amount Sent");
        // transfer amount
        (bool success, ) = payable(owner).call{value: msg.value}("");
        require(success, "Transfer of order amount failed");
    }

    /**
     * @notice returns television information
     * @param _index: television index
     */
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
        return (
            televisions[_index].name,
            televisions[_index].image,
            televisions[_index].price,
            televisions[_index].sold
        );
    }

    /**
     * @notice returns the amount of televisions in the contract
     */
    function getTelevisionslength() public view returns (uint256) {
        return (televisionsLength);
    }
}

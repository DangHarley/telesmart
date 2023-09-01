// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Television Contract
 * @dev A smart contract for managing televisions and orders, with ownership functionality.
 */
contract Television is Ownable {

    /**
    * @dev Array containing information about different televisions.
    */
    TelevisionInfo[] private televisions;

    /**
    * @dev Struct representing an order for televisions.
    * @param televisionId ID of the television in the order.
    * @param count Number of televisions ordered.
    */
    struct Order {
        uint256 televisionId;
        uint256 count;
    }

    /**
    * @dev Struct representing information about a television.
    * @param name Name of the television.
    * @param image Image URL of the television.
    * @param price Price of the television.
    * @param sold Number of units sold for the television.
    */
    struct TelevisionInfo {
        string name;
        string image;
        uint256 price;
        uint256 sold;
    }


    /**
     * @dev Emitted when a new television is added to the contract.
     * @param name Name of the added television.
     * @param image Image URL of the added television.
     * @param price Price of the added television.
     */
    event TelevisionAdded(string name, string image, uint256 price);

    /**
     * @dev Emitted when an order is placed for televisions.
     * @param buyer Address of the buyer who placed the order.
     * @param televisionId ID of the television in the order.
     * @param count Number of televisions ordered.
     */
    event OrderPlaced(address indexed buyer, uint256 indexed televisionId, uint256 count);


     /**
     * @dev Add a new television to the contract.
     * @param _name Name of the television.
     * @param _image Image URL of the television.
     * @param _price Price of the television.
     */
    function addNewTelevision(
        string memory _name,
        string memory _image,
        uint256 _price
    ) public onlyOwner {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_image).length > 0, "Image URL cannot be empty");
        require(_price > 0, "Price must be greater than 0");
        
        televisions.push(TelevisionInfo(_name, _image, _price, 0));
        emit TelevisionAdded(_name, _image, _price);
    }

    /**
     * @dev Place an order for televisions.
     * @param _orders Array of orders, each containing televisionId and count.
     */
    function placeOrder(Order[] memory _orders) public payable {
        uint256 totalAmount;
       for (uint256 i = 0; i < _orders.length; i++) {
            Order memory _order = _orders[i];
            require(_order.televisionId < televisions.length, "Invalid television ID");

            TelevisionInfo storage _television = televisions[_order.televisionId];
            require(_television.price > 0, "Television does not exist");
             // Ensure that the batch size is not greater than the length of _orders
            uint256 ordersToProcess = batchSize;
            if (ordersToProcess > _orders.length) {
                ordersToProcess = _orders.length;
            }

            totalAmount += _television.price * _order.count;
            _television.sold += _order.count; // This line modifies the actual data in the 'televisions' array

            emit OrderPlaced(msg.sender, _order.televisionId, _order.count);
        }
        require(totalAmount == msg.value, "Invalid amount sent");
        (bool success, ) = owner().call{value: msg.value}("");
        require(success, "Transfer of order amount failed");
    }


    /**
     * @dev Get information about a television.
     * @param _index Index of the television in the array.
     * @return name Television name.
     * @return image Television image URL.
     * @return price Television price.
     * @return sold Number of units sold for the television.
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
        require(_index < televisions.length, "Invalid television ID");
        TelevisionInfo storage tv = televisions[_index];
        return (tv.name, tv.image, tv.price, tv.sold);
    }

    /**
     * @dev Get the total number of televisions in the contract.
     * @return Total number of televisions.
     */
    function getTelevisionsLength() public view returns (uint256) {
        return televisions.length;
    }
}
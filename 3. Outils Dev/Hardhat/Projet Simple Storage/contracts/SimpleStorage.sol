// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleStorage {

    uint256 nombre;

    // constructeur payable
    // Permet au contrat de recevoir des fonds pour executer des opérations
    constructor (uint _nombre) payable {
        nombre = _nombre;
    }

    function setNombre(uint256 _nombre) public {
        nombre = _nombre;
    }

    function getNombre() public view returns(uint256) {
        return nombre;
    }

}
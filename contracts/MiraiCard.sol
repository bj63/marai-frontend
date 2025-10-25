// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MiraiCard
/// @notice Dynamic ERC-721 collection representing Mirai's emotional states.
contract MiraiCard is ERC721URIStorage, Ownable {
    struct PersonalityProfile {
        uint8 energy;
        uint8 creativity;
        uint8 empathy;
        uint8 logic;
    }

    uint256 public tokenCounter;
    mapping(uint256 => string) public emotionType;
    mapping(uint256 => string) public auraColor;
    mapping(uint256 => uint8) public rarity;
    mapping(uint256 => PersonalityProfile) private personalities;

    event CardMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string tokenURI,
        string emotion,
        string aura,
        uint8 rarity
    );

    event CardUpdated(
        uint256 indexed tokenId,
        string tokenURI,
        string emotion,
        string aura,
        uint8 rarity
    );

    constructor() ERC721("MiraiCard", "MIRAI") {
        tokenCounter = 0;
    }

    /// @notice Mint a new Mirai emotional card.
    /// @param to Recipient of the NFT.
    /// @param _tokenURI Metadata URI describing emotion + visuals.
    /// @param _emotion Primary emotion descriptor.
    /// @param _aura Aura color in hex/HSL format.
    /// @param profile Initial personality snapshot.
    /// @param _rarity Calculated rarity bucket (0-100).
    function mintCard(
        address to,
        string memory _tokenURI,
        string memory _emotion,
        string memory _aura,
        PersonalityProfile memory profile,
        uint8 _rarity
    ) public onlyOwner returns (uint256) {
        uint256 newId = tokenCounter;
        _safeMint(to, newId);
        _setTokenURI(newId, _tokenURI);
        emotionType[newId] = _emotion;
        auraColor[newId] = _aura;
        rarity[newId] = _rarity;
        personalities[newId] = profile;
        tokenCounter += 1;

        emit CardMinted(newId, to, _tokenURI, _emotion, _aura, _rarity);
        return newId;
    }

    /// @notice Update metadata + stats as the NFT evolves with user emotion data.
    function updateCard(
        uint256 tokenId,
        string memory _tokenURI,
        string memory _emotion,
        string memory _aura,
        PersonalityProfile memory profile,
        uint8 _rarity
    ) public onlyOwner {
        require(_exists(tokenId), "Card does not exist");
        _setTokenURI(tokenId, _tokenURI);
        emotionType[tokenId] = _emotion;
        auraColor[tokenId] = _aura;
        rarity[tokenId] = _rarity;
        personalities[tokenId] = profile;

        emit CardUpdated(tokenId, _tokenURI, _emotion, _aura, _rarity);
    }

    /// @notice Fetch stored personality stats for UI/analytics.
    function getPersonality(uint256 tokenId) external view returns (PersonalityProfile memory) {
        require(_exists(tokenId), "Card does not exist");
        return personalities[tokenId];
    }
}

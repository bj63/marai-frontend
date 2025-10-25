// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./MiraiCoin.sol";
import "./MiraiCard.sol";

/// @title MiraiMarketplace
/// @notice Polygon marketplace for minting + trading Mirai emotional NFTs using MiraiCoin.
contract MiraiMarketplace is Ownable, ReentrancyGuard {
    MiraiCoin public immutable token;
    MiraiCard public immutable nft;

    uint96 public royaltyBps = 500; // 5% royalty scaled by 10_000.
    address public royaltyRecipient;

    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool active;
    }

    mapping(uint256 => Listing) private listings;
    uint256[] private activeListingIds;

    event Listed(uint256 indexed tokenId, uint256 price, address indexed seller);
    event ListingCancelled(uint256 indexed tokenId, address indexed seller);
    event PriceUpdated(uint256 indexed tokenId, uint256 price, address indexed seller);
    event Sold(uint256 indexed tokenId, address indexed buyer, uint256 price);
    event RoyaltyUpdated(uint96 bps, address indexed recipient);

    constructor(address tokenAddress, address nftAddress, address ownerAddress) Ownable(ownerAddress) {
        require(tokenAddress != address(0) && nftAddress != address(0), "Invalid contract address");
        token = MiraiCoin(tokenAddress);
        nft = MiraiCard(nftAddress);
        royaltyRecipient = ownerAddress;
    }

    /// @notice Returns a listing for a token.
    function getListing(uint256 tokenId) external view returns (Listing memory) {
        return listings[tokenId];
    }

    /// @notice Returns all active listings.
    function getActiveListings() external view returns (Listing[] memory) {
        uint256 activeCount = 0;
        uint256 length = activeListingIds.length;
        for (uint256 i = 0; i < length; i++) {
            if (listings[activeListingIds[i]].active) {
                activeCount++;
            }
        }

        Listing[] memory result = new Listing[](activeCount);
        uint256 idx = 0;
        for (uint256 i = 0; i < length; i++) {
            Listing memory listing = listings[activeListingIds[i]];
            if (listing.active) {
                result[idx] = listing;
                idx++;
            }
        }
        return result;
    }

    function listCard(uint256 tokenId, uint256 price) external nonReentrant {
        require(price > 0, "Price must be positive");
        require(nft.ownerOf(tokenId) == msg.sender, "Not owner");
        require(
            nft.getApproved(tokenId) == address(this) || nft.isApprovedForAll(msg.sender, address(this)),
            "Approve marketplace"
        );
        require(token.allowance(msg.sender, address(this)) >= price, "Approve MiraiCoin spending");

        Listing storage listing = listings[tokenId];
        listing.tokenId = tokenId;
        listing.seller = msg.sender;
        listing.price = price;
        listing.active = true;
        if (!_isActiveId(tokenId)) {
            activeListingIds.push(tokenId);
        }

        emit Listed(tokenId, price, msg.sender);
    }

    function updateListing(uint256 tokenId, uint256 price) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Inactive");
        require(listing.seller == msg.sender, "Not seller");
        require(price > 0, "Price must be positive");

        listing.price = price;
        emit PriceUpdated(tokenId, price, msg.sender);
    }

    function cancelListing(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Inactive");
        require(listing.seller == msg.sender || msg.sender == owner(), "Not authorized");

        listing.active = false;
        emit ListingCancelled(tokenId, listing.seller);
    }

    function buyCard(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Inactive");
        require(token.balanceOf(msg.sender) >= listing.price, "Insufficient funds");
        require(token.allowance(msg.sender, address(this)) >= listing.price, "Approve MiraiCoin spending");

        listing.active = false;
        uint256 royalty = (listing.price * royaltyBps) / 10_000;
        uint256 sellerAmount = listing.price - royalty;

        require(token.transferFrom(msg.sender, listing.seller, sellerAmount), "Payment failed");
        if (royalty > 0) {
            require(token.transferFrom(msg.sender, royaltyRecipient, royalty), "Royalty payment failed");
        }

        nft.safeTransferFrom(listing.seller, msg.sender, tokenId);
        emit Sold(tokenId, msg.sender, listing.price);
    }

    function setRoyalty(uint96 bps, address recipient) external onlyOwner {
        require(bps <= 1_000, "Royalty too high");
        require(recipient != address(0), "Invalid recipient");
        royaltyBps = bps;
        royaltyRecipient = recipient;
        emit RoyaltyUpdated(bps, recipient);
    }

    function _isActiveId(uint256 tokenId) private view returns (bool) {
        uint256 length = activeListingIds.length;
        for (uint256 i = 0; i < length; i++) {
            if (activeListingIds[i] == tokenId) {
                return true;
            }
        }
        return false;
    }
}

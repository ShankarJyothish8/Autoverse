// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Autoverse {

    // STATE Variable
    struct Car {
        uint256 productID;
        address owner;
        uint256 price;
        string carTitle;
        string category;
        string images;
        string carAddress;
        string description;
        address[] reviewers;
        string[] reviews;
    }

    // Mapping
    mapping(uint256 => Car) private cars;
    uint256 public carIndex;

    // Events
    event CarListed(uint256 indexed id, address indexed owner, uint256 price);
    event CarSold(uint256 indexed id, address indexed oldOwner, address indexed newOwner, uint256 price);
    event CarResold(uint256 indexed id, address indexed oldOwner, address indexed newOwner, uint256 price);

    // ReviewSection
    struct Review {
        address reviewer;
        uint256 productId;
        uint256 rating;
        string comment;
        uint256 likes;
    }

    struct Product {
        uint256 productId;
        uint256 totalRating;
        uint256 numReviews;
    }

    mapping(uint256 => Review[]) private reviews;
    mapping(address => uint256[]) private userReviews;
    mapping(uint256 => Product) private products;

    uint256 public reviewsCounter;

    event ReviewAdded(uint256 indexed productId, address indexed reviewer, uint256 rating, string comment);
    event ReviewLiked(uint256 indexed productId, uint256 indexed reviewIndex, address indexed liker, uint256 likes);

    // Function in the contract
    function listCar(
        address owner,
        uint256 price,
        string memory _carTitle,
        string memory _category,
        string memory _images,
        string memory _carAddress,
        string memory _description
    ) external returns (uint256) {
        require(price > 0, "Price must be greater than 0");

        uint256 productId = carIndex++;

        Car storage car = cars[productId];
        car.productID = productId;
        car.owner = owner;
        car.price = price;
        car.carTitle = _carTitle;
        car.category = _category;
        car.images = _images;
        car.carAddress = _carAddress;
        car.description = _description;

        emit CarListed(productId, owner, price);

        return productId;
    }

    function updateCar(
        address owner,
        uint256  productId,
        string memory _carTitle,
        string memory _category,
        string memory _images,
        string memory _carAddress,
        string memory _description
    ) external returns (uint256) {
        Car storage car = cars[productId];
        require(car.owner == owner, "You are not the owner");
        car.carTitle = _carTitle;
        car.category = _category;
        car.images = _images;
        car.carAddress = _carAddress;
        car.description = _description;

        return productId;
    }

    function updatePrice(address owner, uint256 productId, uint256 price) external returns (string memory) {
        Car storage car = cars[productId];
        require(car.owner == owner, "You are not the owner");
        car.price = price;
        return "Your car price is updated";
    }

    function buyCar(uint256 id, address buyer) external payable {
        uint256 amount = msg.value;
        require(amount >= cars[id].price, "Insufficient funds");

        Car storage car = cars[id];
        (bool sent,) = payable(car.owner).call{value: amount}("");

        if (sent) {
            car.owner = buyer;
            emit CarSold(id, car.owner, buyer, amount);
        }
    }

    function getAllCars() public view returns (Car[] memory) {
        uint256 itemCount = carIndex;
        uint256 currentIndex = 0;

        Car[] memory items = new Car[](itemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            uint256 currentId = i + 1;

            Car storage currentItem = cars[currentId];
            items[currentIndex] = currentItem;
            currentIndex += 1;
        }
        return items;
    }

    function getCar(uint256 id) external view returns (uint256, address, uint256, string memory, string memory, string memory, string memory, string memory) {
        Car memory car = cars[id];
        return (
            car.productID,
            car.owner,
            car.price,
            car.carTitle,
            car.category,
            car.images,
            car.carAddress,
            car.description
        );
    }

    function getUserCars(address user) external view returns (Car[] memory) {
        uint256 totalItemCount = carIndex;
        uint256 itemCount = 0;
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (cars[i + 1].owner == user) {
                itemCount += 1;
            }
        }
        Car[] memory items = new Car[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (cars[i + 1].owner == user) {
                uint256 currentId = i + 1;
                Car storage currentItem = cars[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    // Reviews Function
    function addReview(uint256 productId, uint256 rating, string calldata comment, address user) external {
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");

        Car storage car = cars[productId];
        car.reviewers.push(user);
        car.reviews.push(comment);

        reviews[productId].push(Review(user, productId, rating, comment, 0));
        userReviews[user].push(productId);

        products[productId].totalRating += rating;
        products[productId].numReviews++;

        emit ReviewAdded(productId, user, rating, comment);

        reviewsCounter++;
    }

    function getProductReviews(uint256 productId) external view returns (Review[] memory) {
        return reviews[productId];
    }

    function getUserReviews(address user) external view returns (Review[] memory) {
        uint256 totalReviews = userReviews[user].length;

        Review[] memory userProductReviews = new Review[](totalReviews);
        for (uint256 i = 0; i < userReviews[user].length; i++) {
            uint256 productId = userReviews[user][i];
            Review[] memory productReviews = reviews[productId];

            for (uint256 j = 0; j < productReviews.length; j++) {
                if (productReviews[j].reviewer == user) {
                    userProductReviews[i] = productReviews[j];
                }
            }
        }
        return userProductReviews;
    }

    function likeReview(uint256 productId, uint256 reviewIndex, address user) external {
        Review storage review = reviews[productId][reviewIndex];
        review.likes++;
        emit ReviewLiked(productId, reviewIndex, user, review.likes);
    }

    function getHigehestratedProduct() external view returns (uint256) {
        uint256 highestRating = 0;
        uint256 highestRatedProductId = 0;

        for (uint256 i = 0; i < reviewsCounter; i++) {
            uint256 productId = i + 1;
            if (products[productId].numReviews > 0) {
                uint256 avgRating = products[productId].totalRating / products[productId].numReviews;

                if (avgRating > highestRating) {
                    highestRating = avgRating;
                    highestRatedProductId = productId;
                }
            }
        }
        return highestRatedProductId;
    }
}
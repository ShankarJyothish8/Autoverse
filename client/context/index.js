import React, { useEffect, useContext, createContext } from "react";

import {
  useAddress,
  useContract,
  useMetamask,
  useContractWrite,
  useContractRead,
  useContractEvents,
} from "@thirdweb-dev/react";

import { ethers } from "ethers";

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const { contract } = useContract(
    "0xCeFdBe0Cc500dB0d7C26130704270D7D8E2BE253"
  );
  console.log(contract);

  const address = useAddress();
  const connect = useMetamask();

  const autoverse = "Autoverse DAPP";

  const { mutateAsync: listCar, isLoading } = useContractWrite(
    contract,
    "listCar"
  );
  const createCarFunction = async (form) => {
    const { carTitle, description, category, price, images, carAddress } = form;
    try {
      const data = await listCar({
        address,
        price,
        carTitle,
        category,
        images,
        carAddress,
        description,
      });
      console.info("contract call successs", data);
    } catch (err) {
      console.error("contract call failure", err);
    }
  };

  //updateCar
  const { mutateAsync: updateCar, isLoading: updateCarLoading } =
    useContractWrite(contract, "updateCar");
  const updateCarFunction = async (form) => {
    const { productId, carTitle, description, category, images, carAddress } =
      form;
    try {
      const data = await updateCar({
        args: [
          address,
          productId,
          carTitle,
          category,
          images.carAddress,
          description,
        ],
      });
      connect.log("contract call successfully update", data);
    } catch (error) {
      console.log("Error while updating", error);
    }
  };

  //update Price
  const { mutateAsync: updatePrice, isLoading: updatePriceLoading } =
    useContractWrite(contract, "updateCar");
  const updatePriceFunction = async (form) => {
    const { productId, price } = form;
    try {
      const data = await updatePrice([address, productId, price]);
      console.log("transaction successfully");
    } catch (error) {
      console.log("fail transaction", error);
    }
  };

  //buyCar
  const { mutateAsync: buyCar, isLoading: buyCarLoading } = useContractWrite(
    contract,
    "buyCar"
  );

  const buyCarFunction = async (form) => {
    const { id } = form;
    try {
      const data = await buyCar({ args: [id, address] });
      console.log("Buying successfully", data);
    } catch (error) {
      console.log("Buying fail", error);
    }
  };

  //REVIEWS Functions
  //addReview
  const { mutateAsync: addReview, isLoading: addReviewLoading } =
    useContractWrite(contract, "addReview");

  const addReviewFunction = async () => {
    const { productId, rating, comment } = from;
    try {
      const data = await addReview({
        args: [productId, rating, comment, address],
      });
      console.log("successfully added review", data);
    } catch (error) {
      console.log("adding review fail", error);
    }
  };

  //LikeReview
  const { mutateAsync: likeReview, isLoading: likeReviewLoading } =
    useContractWrite(contract, "likeReview");

  const likeReviewFunction = async (from) => {
    const { productId, reviewIndex } = from;
    try {
      const data = await likeReview({
        args: [productId, reviewIndex, address],
      });
      console.log("successfully liked review", data);
    } catch (error) {
      console.log("Liking failed", error);
    }
  };

  const getcarData = async () => {
    try {
      const product = await contract.call("getAllCars");
      const parsedproduct = product.map((product, i) => ({
        owner: product.owner,
        title: product.productTitle,
        description: product.description,
        category: product.category,
        price: ethers.utils.formatEther(product.price.toString()),
        productId: product.productID.toNumber(),
        reviewers: product.reviewers,
        reviews: product.reviews,
        image: product.images,
        address: product.productAddress,
      }));

      return parsedproduct;
      console.log(product);
    } catch (error) {
      console.log("Error while loading data", error);
    }
  };

  //gethighestratedprodunct
  const {
    data: getHighestratedProduct,
    isLoading: getHighestratedProductLoading,
  } = useContractRead(contract, "getHighestratedProduct");

  //getProductreview
  const getProductReviewsFunction = (productId) => {
    try {
      const { data: getProductReviews, isLoading: getProductReviewsLoading } =
        useContractRead(contract, "getProductReviews");
      return getProductReviews, getHighestratedProductLoading;
    } catch (error) {
      console.log("faield to get property", error);
    }
  };

  //getProperty
  const getCarFunction = (id) => {
    try {
      const { data: getCar, isLoading: getCarLoading } = useContractRead(
        "getCar",
        [id]
      );
      return getCar, getCarLoading;
    } catch (error) {
      console.log("Error while getting single car", error);
    }
  };

  //getUserCars
  const getUserCarsFunction = () => {
    try {
      const { data: getUserCars, isLoading: getUserCarLoading } =
        useContractRead("getUserCars", [address]);
      return getUserCars, getUserCarLoading;
    } catch (error) {
      console.log("error while getting user cars", error);
    }
  };

  //getUserReviews
  const getUserReviewsFunction = () => {
    try {
      const { data: getUserReviews, isLoading: getUserReviewsLoading } =
        useContractRead("getUserReviews", [address]);
      return getUserReviews, getUserReviewsLoading;
    } catch (error) {
      console.log("error", error);
    }
  };

  //totalCarFunction
  const totalCarFunction = () => {
    try {
      const { data: totalCar, isLoading: totalCarLoading } = useContractRead(
        contract,
        "propertyIndex"
      );
      return totalCar, totalCarLoading;
    } catch (error) {
      console.log(error);
    }
  };

  //totalReviews
  const totalReviewsFunction = () => {
    try {
      const { data: totalReviewsCount, isLoading: totalReviewsCountLoading } =
        useContractRead(contract, "reviewsCounter");
      return totalReviewsCount, totalReviewsCountLoading;
    } catch (error) {
      console.log(error);
    }
  };

  //Read data with events
  //get specific events
  const { data: event } = useContractEvents(contract, "CarListed");

  //Getallevents
  const { data: allEvents } = useContractEvents(contract);

  //set default
  const { data: eventWithoutListener } = useContractEvents(
    contract,
    undefined,
    { subscribe: false }
  );

  console.log(event);

  return (
    <StateContext.Provider
      value={{
        address,
        connect,
        contract,
        autoverse,
        createCarFunction,
        updateCarFunction,
        updatePriceFunction,
        buyCarFunction,
        addReviewFunction,
        likeReviewFunction,
        //Read
        getcarData,
        getHighestratedProduct,
        getProductReviewsFunction,
        getCarFunction,
        getUserCarsFunction,
        getUserReviewsFunction,
        totalCarFunction,
        totalReviewsFunction,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);

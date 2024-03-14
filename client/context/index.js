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

    const{
      carTitle,
      description,
      category,
      price,
      images,
      carAddress,
    }=form;
    try {
      const data = await listCar({
         
          address,
          price,
          carTitle,
          category,
          images,
          carAddress,
          description,
      },
      );
      console.info("contract call successs", data);
    } catch (err) {
      console.error("contract call failure", err);
    }
  };

  const getcarData = async () => {
    try { 
    const product = await contract.call("getAllCars");
    const parsedproduct = product.map((product, i) => ({
      owner: product. owner,
      title: product. productTitle,
      description: product.description,
      category: product. category,
      price: ethers.utils. formatEther(product.price.toString()),
      productId: product.productID. toNumber(),
      reviewers: product. reviewers,
      reviews: product. reviews,
      image: product. images,
      address: product. productAddress,
    }));
      
      return parsedproduct;
      console. log(product);

    } catch (error) {
    console. log("Error while loading data", error);
    }
  };

  return (
    <StateContext.Provider value={{ address, connect, contract, autoverse,createCarFunction,getcarData, }}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);

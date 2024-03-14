import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

import { useStateContext } from "../context";
import { checkIfImage } from "../utils";

const index = () => {
  const { address, connect, contract, autoverse, createCarFunction, getcarData } =
    useStateContext();

  const [isLoading, setIsLoading] = useState(false);
  const [product, setproduct] = useState([]);

  const [form, setForm] = useState({
    carTitle: "",
    description: "",
    category: "",
    price: "",
    images: "",
    carAddress: "",
  });

  const handleFormFieldChange = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    checkIfImage(form.images, async (exists) => {
      if (exists) {
        setIsLoading(true);
        await createCarFunction({
          ...form,
          price: ethers.utils.parseUnits(form.price, 18),
        });
        setIsLoading(false);
      } else {
        alert("Please provide valid image URL");
        setForm({ ...form, images: "" });
      }
    });
  };

  //READ DATA OR GET DATA
const fetchproduct = async () =>{
setIsLoading(true);
const data = await getcarData();
setproduct(data);
setIsLoading(false);
};

useEffect(() => {
  if (contract) fetchproduct();
},   [address, contract]);

  return (
    <div>
      <h1>{autoverse}</h1>
      <button onClick={() => connect()}>Connect</button>
      <h1>Create</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="carTitle"
            onChange={(e) => handleFormFieldChange(carTitle, e)}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="description"
            onChange={(e) => handleFormFieldChange(description, e)}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="category"
            onChange={(e) => handleFormFieldChange(category, e)}
          />
        </div>
        <div>
          <input
            type="number"
            placeholder="price"
            onChange={(e) => handleFormFieldChange(price, e)}
          />
        </div>
        <div>
          <input
            type="url"
            placeholder="images"
            onChange={(e) => handleFormFieldChange(images, e)}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="carAddress"
            onChange={(e) => handleFormFieldChange(carAddress, e)}
          />
        </div>
        <button type="submit">submit</button>
      </form>
    </div>
  );
};

export default index;

import axios from "axios";
import React, { useEffect, useState } from "react";

export const Messages = () => {
  const [msgs, setMsgs] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/messages");
  }, []);
  return <div></div>;
};

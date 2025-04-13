import { useState, useEffect } from "react"; 
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom"; 
import "../styles/components/Cart.scss";
import BackgroundTree from "../components/BackgroundTree";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;
const datas = {
  order: null,
  products: []
};

export default function OrderPage() {
  const [orderDatas, setOrderDatas] = useState(datas);
  const [isLoading, setIsLoading] = useState(false);
  const [isScreenLoading, setIsScreenLoading] = useState(false);
  const navigate = useNavigate(); 

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, []);
  
  const getOrder = async () => {
    setIsScreenLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/${API_PATH}/orders`);
      const order = res.data.orders[0];
      const productIds = Object.keys(order.products);
      const products = [];
      
      productIds.forEach((productId) => {
        const data = {
          productData: order.products[productId].product,
          qty: order.products[productId].qty
        }
        products.push(data);
      });
      
      setOrderDatas({ order, products });
    } catch (error) {
      alert(error);
    } finally {
      setIsScreenLoading(false);
    }
  };

  const handleCheckOut = async (orderId) => {
    setIsLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/${API_PATH}/pay/${orderId}`);
      getOrder();
      setTimeout(() => {
        navigate('/');
      }, 5000);
    } catch (error) {
      alert(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getOrder();
  }, []);

  const order = orderDatas.order; // <<<< 這行加上！

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column'  }}>
      <div className="banner d-flex align-items-center justify-content-start">
        <h2 className="text-start banner-title mb-4">訂單明細列表</h2>
      </div>
      <div className="container container-layout" >
        <BackgroundTree />
        <div className="border" style={{maxWidth: '692px', width: '100%', padding: '12px', margin: '10px auto 0' }}>
          <div key={order?.id}>
            <div md={4}>
              {orderDatas.products?.map((product) => {
                return (
                  <div key={product.productData.id} className="d-flex align-items-center my-3 ">
                    <div>
                      <img
                        className="me-3"
                        src={product.productData.imageUrl}
                        alt={product.productData.title.replace(/\(.*$/, "")}
                        style={{width: '100px', height: '100px', objectFit: 'cover'}}
                      />
                    </div>
                    <div className="cart-text-sub">
                      <label className="cart-text-name">{product.productData.title.replace(/\(.*$/, "")}</label>
                      <label className="cart-text-ticket">{product.productData.unit}</label>
                      <p className="cart-text-price">{`NT ${product.productData.price.toLocaleString()} X ${product.qty}`}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div md={4}>
              <ul className="list-unstyled">
                <li className="d-flex justify-content-between">
                  <label className="fw-normal">電子郵件</label>
                  <label className="fw-normal">{order?.user?.email || "N/A"}</label>
                </li>
                <li className="d-flex justify-content-between">
                  <label className="fw-normal">收件人姓名</label>
                  <label className="fw-normal">{order?.user?.name || "N/A"}</label>
                </li>
                <li className="d-flex justify-content-between">
                  <label className="fw-normal">收件人電話</label>
                  <label className="fw-normal">{order?.user?.tel || "N/A"}</label>
                </li>
                <hr />
                <li className="d-flex justify-content-between">
                  <label className="fw-normal">付款金額</label>
                  <label className="fw-normal">{`NT ${order?.total?.toLocaleString()}`}</label>
                </li>
                <li className="d-flex justify-content-between">
                  <label className="fw-normal">付款方式</label>
                  <label className="fw-normal">{order?.user?.payment || "N/A"}</label>
                </li>
                <li className="d-flex justify-content-between">
                  <label className="fw-normal">付款狀態</label>
                  <label
                    className={
                      order?.is_paid === true
                        ? "text-success"
                        : "text-danger fw-bold"
                    }
                  >
                    {order?.is_paid ? "已付款" : "未付款"}
                  </label>
                </li>
              </ul>
            </div>
            <div className="d-flex justify-content-between">
              <span></span>
              <button
                className="order-button cart-order-button"
                disabled={order?.is_paid}
                onClick={() => handleCheckOut(order?.id)}
              >
                確認付款
                {isLoading && (
                  <ClipLoader 
                    color={'#000000'}
                    size={15}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      {isScreenLoading && (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(255,255,255,0.3)",
            zIndex: 999
          }}
        >
          <ClipLoader 
            color={'#000000'}
            size={30}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      )}
    </div>
  );
}

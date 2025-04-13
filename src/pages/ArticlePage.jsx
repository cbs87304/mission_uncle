import { useState, useEffect, useCallback } from "react";
import { ClipLoader } from "react-spinners";
import axios from "axios";
import ArticleDetailModal from "../components/ArticleDetailModal";
import Card from "../components/Card";
import Pagination from "../components/Pagination";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "../styles/components/ArticlePageStyle.scss";
import "../styles/components/ArticleBannerStyle.scss";

const url = import.meta.env.VITE_BASE_URL;
const path = import.meta.env.VITE_API_PATH;

let defaultModalState = {
  author: "",
  create_at: "",
  description: "",
  id: "",
  image: "",
  isPublic: true,
  num: "",
  tag: [],
  title: "",
  content: "",
};

function ArticlePage() {
  const [apiArticles, setApiArticles] = useState([]);
  const [displayArticles, setDisplayArticles] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    total_pages: 1,
    current_page: 1,
    has_pre: false,
    has_next: false,
  });

  // ✅ 修改處 1：只撈單一頁的資料，不用 while 了
  const getArticles = useCallback(async (page = 1) => {
    try {
      const response = await axios.get(`${url}/api/${path}/articles?page=${page}`);
      const articles = response.data.articles;
      const pagination = response.data.pagination;

      setApiArticles(articles);
      setDisplayArticles(articles); // API 就已經回傳 6 筆，不再做 slice
      setPageInfo(pagination);
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  }, []);

  // ✅ 修改處 2：分頁切換時重新請求資料
  const handlePageChange = useCallback((page) => {
    getArticles(page);
  }, [getArticles]);

  // ✅ 修改處 3：一開始只撈第一頁
  useEffect(() => {
    getArticles(1);
  }, [getArticles]);

  // ----------------- 單篇文章 Modal 功能區 -----------------

  const getArticle = async (id) => {
    try {
      const response = await axios.get(`${url}/api/${path}/article/${id}`);
      return response.data;
    } catch (error) {
      alert(error);
    }
  };

  const [isArticleDetailModalOpen, setIsArticleDetailModalOpen] = useState(false);
  const [tempArticle, setTempArticle] = useState(defaultModalState);

  const handleOpenArticleDetailModal = async (article) => {
    const singleArticle = await getArticle(article.id);
    setTempArticle(singleArticle.article);
    setIsArticleDetailModalOpen(true);
  };

  return (
    <>
      <div className="banner d-flex align-items-center justify-content-start">
        <h2 className="text-start banner-title mb-4">精選文章</h2>
      </div>

      {/* <!-- 主要內容 -------------------------> */}
      <div className="container my-5">
        <div className="row">
          {/* <!-- 文章卡片 --> */}
          {displayArticles && displayArticles.length > 0 ? (
            displayArticles.map((article) => (
              <Card
                key={article.id}
                article={article}
                handleOpenArticleDetailModal={handleOpenArticleDetailModal}
              />
            ))
          ) : (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(255,255,255,0.3)",
                zIndex: 999,
                fontSize: 20,
                top: 85,
              }}
            >
              <ClipLoader
                color={"#000000"}
                size={30}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            </div>
          )}
        </div>

        {/* <!-- 分頁元件 --> */}
        {displayArticles && displayArticles.length > 0 && (
          <Pagination
            pageInfo={pageInfo}
            handlePageChange={handlePageChange}
          />
        )}
      </div>

      {/* <!-- Modal 區 --> */}
      <ArticleDetailModal
        tempArticle={tempArticle}
        getArticles={() => getArticles(pageInfo.current_page)} // 重新整理目前頁面
        isOpen={isArticleDetailModalOpen}
        setIsOpen={setIsArticleDetailModalOpen}
      />
    </>
  );
}

export default ArticlePage;
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Search.css";
import { authAPI, postAPI } from "../../utils/api";
import { getAssetUrl } from "../../utils/constants.js";
import { getErrorMessage } from "../../utils/helpers.js";
import PostDetailModal from "../../components/PostDetailModal.jsx";

const UserSearch = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get("q") || "";
  const tagFromUrl = searchParams.get("tag") || "";

  const [searchQuery, setSearchQuery] = useState(queryFromUrl || tagFromUrl);
  const [activeSearch, setActiveSearch] = useState(queryFromUrl || tagFromUrl);
  const [activeTag, setActiveTag] = useState(tagFromUrl);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [postResults, setPostResults] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    setSearchQuery(queryFromUrl || tagFromUrl);
    setActiveTag(tagFromUrl);

    if (tagFromUrl.trim()) {
      runTagSearch(tagFromUrl.trim());
    } else if (queryFromUrl.trim()) {
      runSearch(queryFromUrl.trim());
    } else {
      setActiveSearch("");
      setUserResults([]);
      setPostResults([]);
      setSearchError("");
      setSearchLoading(false);
    }
  }, [queryFromUrl, tagFromUrl]);

  const runTagSearch = async (tag) => {
    setActiveSearch(tag);
    setSearchLoading(true);
    setSearchError("");

    try {
      const postsResponse = await postAPI.searchByTag(tag);
      setUserResults([]);
      setPostResults(postsResponse.data.data || []);
    } catch (err) {
      setSearchError(getErrorMessage(err, "Failed to search by tag. Please try again."));
      setUserResults([]);
      setPostResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const runSearch = async (query) => {
    setActiveSearch(query);
    setSearchLoading(true);
    setSearchError("");

    try {
      const [usersResponse, postsResponse] = await Promise.all([
        authAPI.searchUsers(query),
        postAPI.searchByCaption(query),
      ]);

      setUserResults(usersResponse.data.data || []);
      setPostResults(postsResponse.data.data || []);
    } catch (err) {
      setSearchError(getErrorMessage(err, "Failed to search. Please try again."));
      setUserResults([]);
      setPostResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();

    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      setSearchParams({});
      return;
    }

    setSearchParams({ q: trimmedQuery });
  };

  const clearSearch = () => {
    setSearchQuery("");
    setActiveTag("");
    setSearchParams({});
  };

  const truncateText = (text, maxLength = 80) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  return (
    <div className="search-page">
      <div className="search-page-header">
        <div className="tabs">
          <button
            className="tab"
            onClick={() => navigate("/user/home")}
          >
            For You
          </button>

          <button
            className="tab"
            onClick={() => navigate("/user/explore")}
          >
            Explore
          </button>

          <button className="tab active">
            Search
          </button>
        </div>
      </div>

      <div className="search-panel">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Search users or posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-submit-btn">
            Search
          </button>
        </form>

        {activeSearch && (
          <div className="search-results-header">
            <h1 className="search-results-title">
              {activeTag
                ? `Posts tagged #${activeSearch}`
                : `Results for "${activeSearch}"`}
            </h1>
            <button
              type="button"
              className="search-clear-btn"
              onClick={clearSearch}
            >
              Clear
            </button>
          </div>
        )}

        {searchLoading && (
          <div className="loading-message">Searching...</div>
        )}

        {searchError && <div className="error-message">{searchError}</div>}

        {!searchLoading && !searchError && activeSearch && (
          <>
            {!activeTag && (
              <section className="search-section">
                <h2 className="search-section-title">
                  Users ({userResults.length})
                </h2>
                {userResults.length > 0 ? (
                  <div className="search-user-list">
                    {userResults.map((user) => (
                      <button
                        key={user._id}
                        type="button"
                        className="search-user-card"
                        onClick={() => navigate(`/user/profile/${user._id}`)}
                      >
                        <div className="search-user-avatar">
                          {user.profilePicture ? (
                            <img
                              src={getAssetUrl(user.profilePicture)}
                              alt={user.username}
                            />
                          ) : (
                            <span>{user.username?.charAt(0)?.toUpperCase()}</span>
                          )}
                        </div>
                        <div className="search-user-meta">
                          <span className="search-user-name">@{user.username}</span>
                          {user.bio && (
                            <span className="search-user-bio">
                              {truncateText(user.bio, 60)}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="search-empty">No matching users found.</p>
                )}
              </section>
            )}

            <section className="search-section">
              <h2 className="search-section-title">
                Posts ({postResults.length})
              </h2>
              {postResults.length > 0 ? (
                <div className="search-post-list">
                  {postResults.map((post) => (
                    <button
                      key={post._id}
                      type="button"
                      className="search-post-card"
                      onClick={() => setSelectedPost(post)}
                    >
                      {post.image && (
                        <img
                          src={getAssetUrl(post.image)}
                          alt={post.caption || "Post"}
                          className="search-post-image"
                        />
                      )}
                      <div className="search-post-meta">
                        <p className="search-post-caption">
                          {truncateText(post.caption) || "Untitled post"}
                        </p>
                        <span className="search-post-author">
                          @{post.author_username}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="search-empty">No matching posts found.</p>
              )}
            </section>

            {userResults.length === 0 && postResults.length === 0 && (
              <p className="search-empty search-empty--overall">
                {activeTag
                  ? `No posts found with tag #${activeSearch}.`
                  : "No results found for your search."}
              </p>
            )}
          </>
        )}

        {!activeSearch && !searchLoading && (
          <p className="search-hint">
            Search for users by username or posts by caption.
          </p>
        )}
      </div>

      <PostDetailModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
};

export default UserSearch;

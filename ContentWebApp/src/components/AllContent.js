import React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Multiselect from "multiselect-react-dropdown";
import { SEEDS_URL } from "../Constants";

const AllContent = () => {
  const [content, setContent] = useState([]);
  const [allContent, setAllContent] = useState([]);
  const [options, setOptions] = useState([]);
  const [updateIVRStatus, setUpdateIVRStatus] = useState('');
  const navigate = useNavigate();

  const onUpdateIVR = async () => {
    try {
      const response = await fetch(`https://ivrseedsbits.azurewebsites.net`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setUpdateIVRStatus(data.message);
      console.log(data);
    } catch (error) {
      console.error("Error updating IVR:", error);
    }
  };

  const sortContentByCreationTime = (contentArray) => {
    return contentArray.sort((a, b) => b.creation_time - a.creation_time);
  };

  const generateOptions = (contentList) => {
    const languageSet = new Set();
    const experienceSet = new Set();

    contentList.forEach((contentItem) => {
      if (contentItem.language) {
        languageSet.add(contentItem.language.charAt(0).toUpperCase() + contentItem.language.slice(1));
      }
      if (contentItem.type) {
        experienceSet.add(contentItem.type.charAt(0).toUpperCase() + contentItem.type.slice(1));
      }
    });

    const languageOptions = Array.from(languageSet).map((language, index) => ({
      category: "Language",
      name: language,
      id: index + 1,
    }));

    const experienceOptions = Array.from(experienceSet).map((experience, index) => ({
      category: "Experience",
      name: experience,
      id: index + 1 + languageSet.size,
    }));

    return [...languageOptions, ...experienceOptions];
  };

  const setFilteredList = (selectedList) => {
    let langs = selectedList
      .filter((option) => option.category === "Language")
      .map((option) => option.name.toLowerCase());

    let exps = selectedList
      .filter((option) => option.category === "Experience")
      .map((option) => option.name.toLowerCase());

    if (exps.length === 0) {
      exps = options
        .filter((value) => value.category === "Experience")
        .map((value) => value.name.toLowerCase());
    }

    if (langs.length === 0) {
      langs = options
        .filter((value) => value.category === "Language")
        .map((value) => value.name.toLowerCase());
    }

    const filteredList = allContent.filter(
      (content) =>
        langs.includes(content.language.toLowerCase()) &&
        exps.includes(content.type.toLowerCase())
    );
    setContent(sortContentByCreationTime(filteredList));
  };

  const getAllContent = async () => {
    try {
      const backendUrl = "http://localhost:5000/content"; // Your backend API
      const azureStorageBaseUrl = "https://seedsbits.blob.core.windows.net/"; // Azure Storage base URL
  
      const response = await fetch(backendUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "authToken": "postman",// Replace with actual token or phone number like '+911234567890'
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch content: ${response.statusText}`);
      }
  
      const data = await response.json();
  
      // Prepend full Azure URL to audio fields
      const updatedData = data.map((content) => ({
        ...content,
        title: {
          ...content.title,
          audioUrl: content.title?.audioUrl
            ? `${azureStorageBaseUrl}${content.title.audioUrl}`
            : content.title?.audioUrl,
        },
        theme: {
          ...content.theme,
          audioUrl: content.theme?.audioUrl
            ? `${azureStorageBaseUrl}${content.theme.audioUrl}`
            : content.theme?.audioUrl,
        },
        audioContent: content.audioContent?.map((audio) => ({
          ...audio,
          audioUrl: audio.audioUrl
            ? `${azureStorageBaseUrl}${audio.audioUrl}`
            : audio.audioUrl,
        })) || [],
      }));
  
      return updatedData;
    } catch (error) {
      console.error("Error fetching content:", error);
      return [];
    }
  };
  
    useEffect(() => {
        const getContent = async () => {
            try {
                const contentFromServer = await getAllContent();
                const contentFromServerNotDeleted = contentFromServer.filter((content) => !content.isDeleted);
                setAllContent(sortContentByCreationTime(contentFromServerNotDeleted));
                setContent(sortContentByCreationTime(contentFromServerNotDeleted));
                setOptions(generateOptions(sortContentByCreationTime(contentFromServerNotDeleted)));
            } catch (error) {
                console.error("Error in getContent:", error);
            }
        };
        getContent();
    }, []);

  const onDelete = async (type, id) => {
    console.log(id);
    if (window.confirm("Are you sure?")) {
      if (type === "quiz") {
        await fetch(
          "https://place-seeds.azurewebsites.net/byId?" +
            new URLSearchParams({
              id: id,
              type: "quiz",
            }),
          {
            method: "DELETE",
          }
        );
      } else {
        await fetch(`${SEEDS_URL}/content/${id}`, {
          method: "DELETE",
        });
      }
      setContent(sortContentByCreationTime(content.filter((content) => content.id !== id)));
    }
  };

  const onView = (type, id) => {
    navigate(`/content/detail/${type}/${id}`);
};

  return (
    <div style={{ margin: "30px" }}>
      <h2 style={{ color: "#28574F" }}>Welcome to the SEEDS Content Dashboard!</h2>
      <br />
      <div>
        <Link to="/ivr">
          <button className="btn" style={{ backgroundColor: "#28574F", color: "white" }}>
            IVR Usage
          </button>
        </Link>
      </div>
      <br />
      <div className="align-items-end">
        <Link to="/viewivr">
          <button className="btn" style={{ backgroundColor: "#28574F", color: "white" }}>
            Visualise IVR
          </button>
        </Link>
      </div>
      <br />
      <div className="align-items-end">
        <Link to="/bulkcall">
          <button className="btn" style={{ backgroundColor: "#28574F", color: "white" }}>
            Mass Call
          </button>
        </Link>
      </div>
      <br />
      <Multiselect
        options={options}
        onSelect={(selectedList) => setFilteredList(selectedList)}
        onRemove={(selectedList) => setFilteredList(selectedList)}
        displayValue="name"
        groupBy="category"
        style={{
          chips: {
            background: "#28574f",
          },
          multiselectContainer: {
            color: "#28574f",
          },
        }}
      />
      <br />
      <div className="align-items-end">
        <Link to="/content/create">
          <button className="btn" style={{ backgroundColor: "#28574F", color: "white" }}>
            + Add Content
          </button>
        </Link>
      </div>
      <br />
      <button
        className="btn"
        style={{ backgroundColor: "#28574F", color: "white" }}
        onClick={onUpdateIVR}
      >
        Update IVR
      </button>
      <span>{updateIVRStatus}</span>
      <br />
      {content.length === 0 && <h3>No content found :(</h3>}
      <div className="row">
        {content.length > 0 && (
          <table className="table table-striped table-bordered">
            <thead>
              <tr className="tableHeading">
                <th style={{ color: "white", backgroundColor: "#28574f" }}>TITLE</th>
                <th style={{ color: "white", backgroundColor: "#28574f" }}>THEME</th>
                <th style={{ color: "white", backgroundColor: "#28574f" }}>UPLOADED</th>
                <th style={{ color: "white", backgroundColor: "#28574f" }}>LANGUAGE</th>
                <th style={{ color: "white", backgroundColor: "#28574f" }}>TYPE</th>
                <th style={{ color: "white", backgroundColor: "#28574f" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {content.map((content) => (
                <tr key={content.id || content._id}> {/* Ensure a unique key */}
                  <td>
                    {content.title?.english} <br /> {content.localTitle}
                  </td>
                  <td>
                    {content.theme?.english} <br /> {content.localTheme}
                  </td>
                  <td>
                    {content.isTeacherApp && "TA"}
                    {content.isPullModel && ", IVR"} {content.type === "quiz" && "IVR"}
                  </td>
                  <td>{content.language}</td>
                  <td>{content.type}</td>
                  <td>
                    {/* <button
                      onClick={() => onEdit(content.type, content.id)}
                      className="btn rounded"
                      style={{ backgroundColor: "#E5A83B", color: "white" }}
                    >
                      Edit
                    </button> */}
                    <button
                      style={{
                          marginLeft: "10px",
                          backgroundColor: "#039DCE",
                          color: "white",
                      }}
                      onClick={() => onView(content.type, content.id || content._id)} // Pass the ID to onView
                      className="btn"
                  >
                      View
                  </button>
                    <button
                      style={{ marginLeft: "10px" }}
                      onClick={() => onDelete(content.type, content.id)}
                      className="btn btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AllContent;


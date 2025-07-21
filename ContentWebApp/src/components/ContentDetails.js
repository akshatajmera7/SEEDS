import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import QuizDetails from "./QuizDetails";
import StoryDetails from "./StoryDetails";
import { SEEDS_URL } from "../Constants";

const ContentDetails = () => {
  const { type, id } = useParams();
  const [content, setContent] = useState(null);

  useEffect(() => {
    const getContentById = async () => {
      const contentFromServer = await contentById();
      setContent(contentFromServer);
    };
    getContentById();
  }, []);

  const contentById = async () => {
    const azureStorageBaseUrl = "https://seedsbits.blob.core.windows.net";
    const sasToken =
      "?sp=r&st=2025-04-23T18:30:33Z&se=2025-04-24T02:30:33Z&spr=https&sv=2024-11-04&sr=c&sig=1KCJrIW8jnUOuGZ15psCfoiBOcZA%2Bdtt2TTRRvmK%2FGY%3D";

    try {
      let contentData;

      if (type === "quiz") {
        // Fetch quiz data
        const placeRes = await fetch(
          "https://place-seeds.azurewebsites.net/rawDataById?" +
            new URLSearchParams({
              id: id,
            }),
          {
            method: "GET",
            headers: {
              authToken: "postman", // Add the required authToken header
            },
          }
        );
        if (!placeRes.ok) {
          throw new Error("Failed to fetch quiz data");
        }
        contentData = await placeRes.json();
      } else {
        // Fetch content data
        const seedsRes = await fetch(`${SEEDS_URL}/content/${id}`, {
          method: "GET",
          headers: {
            authToken: "postman", // Add the required authToken header
          },
        });
        if (!seedsRes.ok) {
          throw new Error("Failed to fetch content data");
        }
        contentData = await seedsRes.json();
      }

      // Prepend full Azure URL and append SAS token to audio fields
      const updatedContentData = {
        ...contentData,
        title: {
          ...contentData.title,
          audioUrl: contentData.title?.audioUrl
            ? `${azureStorageBaseUrl}${contentData.title.audioUrl}${sasToken}`
            : contentData.title?.audioUrl,
        },
        theme: {
          ...contentData.theme,
          audioUrl: contentData.theme?.audioUrl
            ? `${azureStorageBaseUrl}${contentData.theme.audioUrl}${sasToken}`
            : contentData.theme?.audioUrl,
        },
        audioContent: contentData.audioContent?.map((audio) => ({
          ...audio,
          audioUrl: audio.audioUrl
            ? `${azureStorageBaseUrl}${audio.audioUrl}${sasToken}`
            : audio.audioUrl,
        })) || [],
      };

      console.log("Updated Content Data with SAS Token:", updatedContentData);
      return updatedContentData;
    } catch (error) {
      console.error("Error fetching content:", error);
      throw error; // Re-throw the error after handling
    }
  };

  if (!content) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ margin: "20px" }}>
      <h3>
        Title: {content.title?.english || "N/A"} ({content.title?.local || "N/A"})
      </h3>
      <p>
        Title Audio:{" "}
        <a
          href={content.title?.audioUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
        >
          {content.title?.audioUrl ? "Play Title Audio" : "No audio available"}
        </a>
      </p>

      <h4>
        Theme: {content.theme?.english || "N/A"} ({content.theme?.local || "N/A"})
      </h4>
      <p>
        Theme Audio:{" "}
        <a
          href={content.theme?.audioUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
        >
          {content.theme?.audioUrl ? "Play Theme Audio" : "No audio available"}
        </a>
      </p>

      {Array.isArray(content.audioContent) && content.audioContent.length > 0 ? (
        <div>
          <h4>Audio Content:</h4>
          {content.audioContent.map((audio, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <p>Description: {audio.description || "N/A"}</p>
              <p>
                Audio URL:{" "}
                <a
                  href={audio.audioUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {audio.audioUrl ? "Play Audio" : "No audio available"}
                </a>
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>No audio content available.</p>
      )}
    </div>
  );
};

export default ContentDetails;
import { useState } from "react";
import AddQuiz from "./AddQuiz";
import AddStory from "./AddStory";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { SEEDS_URL } from "../Constants";

const ContentEdit = () => {
  const { type, id } = useParams();
  const [content, setContent] = useState({});
  const [experience, setExperience] = useState("quiz");

  useEffect(() => {
    const getContentById = async () => {
      const contentFromServer = await contentById();
      setContent(contentFromServer);
      console.log("quizInEdit", contentFromServer);
      setExperience(contentFromServer.type);
    };
    getContentById();
  }, []);

  const contentById = async () => {
    if (type === "quiz") {
      const placeRes = await fetch(
        "https://place-seeds.azurewebsites.net/rawDataById?" +
          new URLSearchParams({
            id: id,
          })
      );
      const data = await placeRes.json();
      console.log(data);
      return data;
    } else {
      const seedsRes = await fetch(`${SEEDS_URL}/content/${id}`, {
        method: "GET",
      });
      const seedsData = await seedsRes.json();
      return seedsData;
    }
  };

  const handleChange = (event) => {
    setExperience(event.target.value);
    console.log(event.target.value);
  };

  if (content && !content.isProcessed) {
    return (
      <div style={{ margin: "20px" }}>
        <h3>{content.title}</h3>
        <p>Content is being processed, try again later!</p>
      </div>
    );
  } else {
    return (
      <div style={{ margin: "20px" }}>
        <h3>Edit Content</h3>
        {content &&
          (experience === "Story" ||
            experience === "Poem" ||
            experience === "Song") && (
            <form>
              <label>
                Experience:
                <select
                  value={experience}
                  onChange={(event) => handleChange(event)}
                  className="mintgreen"
                  style={{ width: "150px" }}
                >
                  <option value="Story">Story</option>
                  <option value="Poem">Poem</option>
                  <option value="Song">Song</option>
                </select>
              </label>
            </form>
          )}
        {content && experience === "quiz" && content.isProcessed && (
          <AddQuiz quiz={content} />
        )}
        {content &&
          experience !== "quiz" &&
          content.isProcessed && (
            <AddStory content={content} contentType={experience} />
          )}
      </div>
    );
  }
};

export default ContentEdit;
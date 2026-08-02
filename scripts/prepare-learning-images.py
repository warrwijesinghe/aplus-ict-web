import argparse
from pathlib import Path

from PIL import Image, ImageOps


REPOSITORY = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = REPOSITORY / "source-learning-images"
DEFAULT_DESTINATION = REPOSITORY / "public" / "images" / "learning-places"

IMAGES = {
    "home-student": "images (11).jfif",
    "outdoor-study": "images (10).jfif",
    "cafe-learning": "images (9).jfif",
    "campus-steps": "images (8).jfif",
    "quiet-study": "images (6).jfif",
    "online-session": "asian-woman-wearing-headphones-study-online-watching-webinar-podcast-on-laptop-listening-learning-education-course-conference-calling-elearning-concept-free-photo.jpg",
    "home-study-notes": "images (5).jfif",
    "study-desk": "images (4).jfif",
    "sofa-study": "teenage-woman-wearing-headphones-sits-on-her-phone-while-listening-to-music-playing-games-ordering-online-on-the-sofa-comfortably-in-a-cafe-photo.jpg",
    "cafe-laptop": "asian-woman-in-denim-jacket-wearing-headphone-looking-an-pointing-at-laptop-sitting-at-table-in-cafe-photo.jpg",
    "outdoor-laptop": "images (3).jfif",
    "video-learning": "asian-female-college-student-using-laptop-and-phone-with-headphones-while-studying-reading-messages-and-greeting-friends-via-video-call-photo.jpg",
    "focused-student": "focused-young-student-engaged-in-remote-learning-on-laptop-with-headphones-african-american-girl-typing-on-computer-during-online-education-class-teenager-concentrating-on-homework-photo.jfif",
    "happy-student": "portrait-of-a-smiling-teenage-student-studying-online-at-home-happy-mixed-race-girl-in-a-remote-learning-or-e-learning-environment-young-girl-with-headphones-using-a-laptop-in-a-modern-setting-photo.jfif",
    "home-learning": "images (2).jfif",
    "young-learner": "images (1).jfif",
    "study-habits": "habits-of-successful-online-students-scaled.jpg",
    "school-desk": "1000-13.png",
    "lesson-study": "Untitled-design-27.png",
    "headset-class": "how-to-choose-the-best-headphones-for-k-12-student-testing-blog-headphones-with-mic-image.webp",
    "headset-learning": "how-to-choose-the-best-headphones-for-k-12-student-testing-blog-meta-image.webp",
}


def optimise(source: Path, destination: Path, max_size: int) -> None:
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original).convert("RGB")
        image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
        image.save(destination, "WEBP", quality=82, method=6)


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepare repository-local learning images as WebP.")
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE, help="Directory containing the source image filenames.")
    parser.add_argument("--destination", type=Path, default=DEFAULT_DESTINATION, help="Directory for generated WebP images.")
    parser.add_argument("--max-size", type=int, default=1600, help="Longest output edge in pixels.")
    args = parser.parse_args()
    source_directory = args.source.resolve()
    destination_directory = args.destination.resolve()
    destination_directory.mkdir(parents=True, exist_ok=True)
    for output_name, source_name in IMAGES.items():
        source = source_directory / source_name
        if not source.exists():
            raise FileNotFoundError(f"Missing source image: {source}. Use --source to select the image directory.")
        optimise(source, destination_directory / f"{output_name}.webp", args.max_size)


if __name__ == "__main__":
    main()

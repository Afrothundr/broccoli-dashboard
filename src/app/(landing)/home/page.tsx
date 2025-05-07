import LandingHero from "./_components/LandingHero";
import LandingFeatures from "./_components/LandingFeatures";
import HomePageGradients from "./_components/HomePageGradients";

export default function HomePage() {
	return (
		<>
			<HomePageGradients />
			<LandingHero />
			<LandingFeatures />
		</>
	);
}

export function NotFound() {
    return (
        <div className="h-screen flex flex-col gap-6 items-center justify-center bg-black">
            <div className="text-purple-600 text-5xl">Not Found !</div>
            <div className="text-lg text-gray-300 font-thin">
                The page you are looking for does not exist. Please check the
                URL and try again.
            </div>
        </div>
    );
}

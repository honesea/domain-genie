import { ArrowPathIcon } from "@heroicons/react/24/solid";

export default function Spinner() {
  return (
    <div className="flex items-center justify-center">
      <ArrowPathIcon className="h-6 w-6 animate-spin" />
    </div>
  );
}

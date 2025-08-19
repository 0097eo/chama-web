import { Chama } from "./api";
import { DateRange } from "react-day-picker";

export interface ReportPageProps {
    activeChama: Chama | null;
    dateRange?: DateRange;
}
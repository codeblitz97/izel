// @ts-nocheck

import type { ReactElement } from "react";

import {
  Menu,
  Tooltip,
  useCaptionOptions,
  useVideoQualityOptions,
  type MenuPlacement,
  type TooltipPlacement,
  useMediaState,
} from "@vidstack/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Captions as ClosedCaptionsIcon,
  Circle as RadioButtonIcon,
  CircleStop as RadioButtonSelectedIcon,
  SettingsIcon,
  Settings2 as QualityIcon,
} from "lucide-react";

import useSkipButtons from "@/hooks/useSkipButtons";
import useAutoSkip from "@/hooks/useAutoSkip";

import { buttonClass, tooltipClass } from "./buttons";

export interface SettingsProps {
  placement: MenuPlacement;
  tooltipPlacement: TooltipPlacement;
}

export const menuClass =
  "animate-out fade-out slide-out-to-bottom-2 data-[open]:animate-in data-[open]:fade-in data-[open]:slide-in-from-bottom-4 flex h-[var(--menu-height)] max-h-[400px] min-w-[260px] flex-col overflow-y-auto overscroll-y-contain rounded-md border border-white/10 bg-black/95 p-2.5 font-sans text-[15px] font-medium outline-none backdrop-blur-sm transition-[height] duration-300 will-change-[height] data-[resizing]:overflow-hidden";

export const submenuClass =
  "hidden w-full flex-col items-start justify-center outline-none data-[keyboard]:mt-[3px] data-[open]:inline-block";

export function Settings({ placement, tooltipPlacement }: SettingsProps) {
  return (
    <Menu.Root className="parent">
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Menu.Button className={buttonClass}>
            <SettingsIcon className="h-8 w-8 transform transition-transform duration-200 ease-out group-data-[open]:rotate-90" />
          </Menu.Button>
        </Tooltip.Trigger>
        <Tooltip.Content className={tooltipClass} placement={tooltipPlacement}>
          Settings
        </Tooltip.Content>
      </Tooltip.Root>
      <Menu.Content className={menuClass} placement={placement}>
        <CaptionSubmenu />
        <QualitySubmenu />
        <AutoSkipSubmenu />
        <ShowSkipButtonsSubmenu />
      </Menu.Content>
    </Menu.Root>
  );
}

function CaptionSubmenu() {
  const options = useCaptionOptions(),
    hint = options.selectedTrack?.label ?? "Off";

  return (
    <Menu.Root>
      <SubmenuButton
        label="Captions"
        hint={hint}
        disabled={options.disabled}
        icon={ClosedCaptionsIcon}
      />
      <Menu.Content className={submenuClass}>
        <Menu.RadioGroup
          className="flex w-full flex-col"
          value={options.selectedValue}
        >
          {options.map(({ label, value, select }) => (
            <Radio value={value} onSelect={select} key={value}>
              {label}
            </Radio>
          ))}
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  );
}

function QualitySubmenu() {
  const options = useVideoQualityOptions({ sort: "descending" }),
    autoQuality = useMediaState("autoQuality"),
    currentQualityText = options.selectedQuality?.height + "p" ?? "",
    hint = !autoQuality ? currentQualityText : `Auto (${currentQualityText})`;

  return (
    <Menu.Root>
      <SubmenuButton
        label="Quality"
        hint={hint}
        disabled={options.disabled}
        icon={QualityIcon}
      />
      <Menu.Content className={submenuClass}>
        <Menu.RadioGroup
          className="flex w-full flex-col"
          value={options.selectedValue}
        >
          {options.map(({ label, value, select }) => (
            <Radio value={value} onSelect={select} key={value}>
              {label}
            </Radio>
          ))}
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  );
}

function AutoSkipSubmenu() {
  const [isAutoSkipOn, toggleAutoSkip] = useAutoSkip(),
    hint = isAutoSkipOn ? "On" : "Off";

  return (
    <>
      <button
        className="parent left-0 z-10 flex w-full cursor-pointer select-none items-center justify-start rounded-sm bg-black/60 p-2.5 outline-none ring-inset ring-media-focus aria-disabled:hidden data-[open]:sticky data-[open]:-top-2.5 data-[hocus]:bg-white/10 data-[focus]:ring-[3px]"
        onClick={() => toggleAutoSkip()}
      >
        <div className="contents parent-data-[open]:hidden">
          {!isAutoSkipOn ? (
            <RadioButtonIcon className="h-5 w-5" />
          ) : (
            <RadioButtonSelectedIcon className="h-5 w-5" />
          )}
        </div>
        <span className="ml-1.5 parent-data-[open]:ml-0">Auto Skip</span>
        <span className="ml-auto text-sm text-white/50">{hint}</span>
      </button>
    </>
  );
}

function ShowSkipButtonsSubmenu() {
  const [isShowSkipButtonsOn, toggleShowSkipButtons] = useSkipButtons(),
    hint = isShowSkipButtonsOn ? "On" : "Off";

  return (
    <>
      <button
        className="parent left-0 z-10 flex w-full cursor-pointer select-none items-center justify-start rounded-sm bg-black/60 p-2.5 outline-none ring-inset ring-media-focus aria-disabled:hidden data-[open]:sticky data-[open]:-top-2.5 data-[hocus]:bg-white/10 data-[focus]:ring-[3px]"
        onClick={() => toggleShowSkipButtons()}
      >
        <div className="contents parent-data-[open]:hidden">
          {!isShowSkipButtonsOn ? (
            <RadioButtonIcon className="h-5 w-5" />
          ) : (
            <RadioButtonSelectedIcon className="h-5 w-5" />
          )}
        </div>
        <span className="ml-1.5 parent-data-[open]:ml-0">Show Buttons</span>
        <span className="ml-auto text-sm text-white/50">{hint}</span>
      </button>
    </>
  );
}

export interface RadioProps extends Menu.RadioProps {}

function Radio({ children, ...props }: RadioProps) {
  return (
    <Menu.Radio
      className="group relative flex w-full cursor-pointer select-none items-center justify-start rounded-sm p-2.5 outline-none ring-media-focus data-[hocus]:bg-white/10 data-[focus]:ring-[3px]"
      {...props}
    >
      <RadioButtonIcon className="h-4 w-4 text-white group-data-[checked]:hidden" />
      <RadioButtonSelectedIcon className="hidden h-4 w-4 text-media-brand group-data-[checked]:block" />
      <span className="ml-2">{children}</span>
    </Menu.Radio>
  );
}

export interface SubmenuButtonProps {
  label: string;
  hint: string;
  disabled?: boolean;
  icon: ReactElement;
}

function SubmenuButton({
  label,
  hint,
  icon: Icon,
  disabled,
}: SubmenuButtonProps) {
  return (
    <Menu.Button
      className="parent left-0 z-10 flex w-full cursor-pointer select-none items-center justify-start rounded-sm bg-black/60 p-2.5 outline-none ring-inset ring-media-focus aria-disabled:hidden data-[open]:sticky data-[open]:-top-2.5 data-[hocus]:bg-white/10 data-[focus]:ring-[3px]"
      disabled={disabled}
    >
      <ChevronLeftIcon className="-ml-0.5 mr-1.5 hidden h-[18px] w-[18px] parent-data-[open]:block" />
      <div className="contents parent-data-[open]:hidden">
        <Icon className="h-5 w-5" />
      </div>
      <span className="ml-1.5 parent-data-[open]:ml-0">{label}</span>
      <span className="ml-auto text-sm text-white/50">{hint}</span>
      <ChevronRightIcon className="ml-0.5 h-[18px] w-[18px] text-sm text-white/50 parent-data-[open]:hidden" />
    </Menu.Button>
  );
}

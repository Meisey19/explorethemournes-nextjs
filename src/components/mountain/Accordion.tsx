'use client';

import { Disclosure, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { Fragment, ReactNode } from 'react';

export interface AccordionSection {
  title: string;
  content: ReactNode;
  defaultOpen?: boolean;
}

interface AccordionProps {
  sections: AccordionSection[];
  className?: string;
}

export function Accordion({ sections, className = '' }: AccordionProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {sections.map((section, index) => (
        <Disclosure
          key={index}
          defaultOpen={section.defaultOpen ?? index === 0}
        >
          {({ open }) => (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 overflow-hidden">
              <Disclosure.Button className="flex justify-between items-center w-full px-6 py-4 text-left hover:bg-slate-700/30 transition-colors">
                <span className="text-lg font-semibold text-white">
                  {section.title}
                </span>
                <ChevronDownIcon
                  className={`w-5 h-5 text-green-400 transition-transform duration-200 ${
                    open ? 'rotate-180' : ''
                  }`}
                />
              </Disclosure.Button>

              <Transition
                as={Fragment}
                enter="transition-all ease-out duration-200"
                enterFrom="opacity-0 max-h-0"
                enterTo="opacity-100 max-h-[2000px]"
                leave="transition-all ease-in duration-150"
                leaveFrom="opacity-100 max-h-[2000px]"
                leaveTo="opacity-0 max-h-0"
              >
                <Disclosure.Panel className="px-6 py-4 text-slate-300 border-t border-slate-700/50">
                  {section.content}
                </Disclosure.Panel>
              </Transition>
            </div>
          )}
        </Disclosure>
      ))}
    </div>
  );
}

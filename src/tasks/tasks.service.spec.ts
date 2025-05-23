import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TaskStatus } from './task-status.enum';
import { TasksRepository } from './tasks.repository';
import { TasksService } from './tasks.service';

const mockTasksRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
});

const mockUser = {
  username: 'Ariel',
  id: 'someId',
  password: 'somePassword',
  tasks: [],
};

describe('TasksService', () => {
  let tasksService: TasksService;
  let tasksRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TasksRepository, useFactory: mockTasksRepository },
      ],
    }).compile();

    tasksService = module.get(TasksService);
    tasksRepository = module.get(TasksRepository);
  });

  describe('getTasks', () => {
    it('calls TasksRepository.getTasks and returns the result', async () => {
      tasksRepository.getTasks.mockResolvedValue('someValue');
      const result = await tasksService.getTasks(null, mockUser);
      expect(result).toEqual('someValue');
    });
  });

  describe('getTaskById', () => {
    it('calls TasksRepository.findOne and returns the result', async () => {
      const mockTask = {
        title: 'Test title',
        description: 'Test desc',
        id: 'someId',
        status: TaskStatus.OPEN,
      };

      tasksRepository.findOne.mockResolvedValue(mockTask);
      const result = await tasksService.getTaskById('someId', mockUser);
      expect(result).toEqual(mockTask);
    });

    it('calls TasksRepository.findOne and handles an error', async () => {
      tasksRepository.findOne.mockResolvedValue(null);
      expect(tasksService.getTaskById('someId', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTask', () => {
    it('calls TasksRepository.createTask and returns the result', async () => {
      const mockTask = {
        title: 'Test title',
        description: 'Test desc',
        id: 'someId',
        status: TaskStatus.OPEN,
      };

      tasksRepository.createTask.mockResolvedValue(mockTask);
      tasksRepository.findOne.mockResolvedValue(mockTask);

      const newTask = await tasksService.createTask(mockTask, mockUser);
      const result = await tasksService.getTaskById(newTask.id, mockUser);

      expect(result).toEqual(mockTask);
    });

    it.todo('calls TasksRepository.createTask and handles an error');
  });

  describe('deleteTask', () => {
    const mockTask = {
      title: 'Test title',
      description: 'Test desc',
      id: 'someId',
      status: TaskStatus.OPEN,
    };

    it('calls TasksRepository.deleteTask and returns the result', async () => {
      tasksRepository.delete.mockResolvedValue({ affected: 1 });
      tasksRepository.createTask.mockResolvedValue(mockTask);

      const newTask = await tasksService.createTask(mockTask, mockUser);

      await expect(
        tasksService.deleteTask(newTask.id, mockUser),
      ).resolves.not.toThrow();
    });

    it('calls TasksRepository.deleteTask and handles an error', async () => {
      tasksRepository.delete.mockResolvedValue({ affected: 0 });
      await expect(
        tasksService.deleteTask(mockTask.id, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTaskStatus', () => {
    it.todo('calls TasksRepository.updateTaskStatus and returns the result');
    it.todo('calls TasksRepository.updateTaskStatus and handles an error');
  });
});
